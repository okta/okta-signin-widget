/*!
 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { _, Form, loc, View } from '@okta/courage';
import hbs from '@okta/handlebars-inline-precompile';
import Util from 'util/Util';
import NumberChallengeView from './NumberChallengeView';

const titleTpl = hbs('{{factorName}} ({{{deviceName}}})');
// deviceName is escaped on BaseForm (see BaseForm's template)

const WARNING_TIMEOUT = 30000; // milliseconds
const PushFormwarningTemplate = View.extend({
  className: 'okta-form-infobox-warning infobox infobox-warning',
  attributes: {
    'aria-live': 'polite',
  },
  template: hbs`
      <span class="icon warning-16"></span>
      <p>{{warning}}</p>
    `,
});

export default Form.extend({
  className: 'mfa-verify-push',
  autoSave: true,
  noCancelButton: true,
  save: _.partial(loc, 'oktaverify.send', 'login'),
  scrollOnError: false,
  layout: 'o-form-theme',
  attributes: { 'data-se': 'factor-push' },
  events: {
    submit: 'submit',
  },

  initialize: function() {
    this.enabled = true;
    this.listenTo(this.options.appState, 'change:isMfaRejected', this.handleRejectStateChange);

    this.numberChallengeView = this.add(NumberChallengeView).last();
    this.listenTo(this.options.appState, 'change:isWaitingForNumberChallenge', function(
      state,
      isWaitingForNumberChallenge
    ) {
      if (isWaitingForNumberChallenge || this.options.appState.get('lastAuthResponse').status === 'SUCCESS') {
        this.clearWarnings();
        this.$el.find('.button').hide();
        this.numberChallengeView.$el.show();
      } else {
        this.numberChallengeView.$el.hide();
        this.$el.find('.button').show();
      }
    });
    this.listenTo(this.options.appState, 'change:isMfaTimeout', function(state, isMfaTimeout) {
      this.setSubmitState(isMfaTimeout);
      if (isMfaTimeout) {
        this.showError(loc('oktaverify.timeout', 'login'));
      }
    });
    this.listenTo(this.options.appState, 'change:isMfaRequired', function(state, isMfaRequired) {
      if (isMfaRequired) {
        this.clearErrors();
        this.clearWarnings();
      }
    });
    this.title = titleTpl({
      factorName: this.model.get('factorLabel'),
      deviceName: this.model.get('deviceName'),
    });
  },
  setSubmitState: function(ableToSubmit) {
    const button = this.$el.find('.button');
    const a11ySpan = this.$el.find('.accessibility-text');
    this.enabled = ableToSubmit;
    if (ableToSubmit) {
      button.removeClass('link-button-disabled');
      button.prop('value', loc('oktaverify.send', 'login'));
      button.prop('disabled', false);
      if (a11ySpan) {
        a11ySpan.remove();
      }
    } else {
      button.addClass('link-button-disabled');
      button.prop('value', loc('oktaverify.sent', 'login'));
      button.prop('disabled', true);
      this.add(
        `<span class='accessibility-text' role='alert'>${loc('oktaverify.sent', 'login')}</span>`,
      );
    }
  },
  submit: function(e) {
    if (e !== undefined) {
      e.preventDefault();
    }
    if (this.enabled) {
      this.setSubmitState(false);
      this.doSave();
    }
  },
  postRender: function() {
    const factorsPolicyInfo = this.options.appState.get('factorsPolicyInfo');
    const id = this.model.get('id');
    const isAutoPushEnabled = this.settings.get('features.autoPush') && factorsPolicyInfo && factorsPolicyInfo[id]
      ? factorsPolicyInfo[id]['autoPushEnabled']
      : false;

    if (isAutoPushEnabled) {
      this.model.set('autoPush', true);
      // bind after $el has been rendered, and trigger push once DOM is fully loaded
      _.defer(_.bind(this.submit, this));
    }
  },
  doSave: function() {
    let warningTimeout;

    this.clearErrors();
    this.clearWarnings();
    if (this.model.isValid()) {
      this.listenToOnce(this.model, 'error', function() {
        this.setSubmitState(true);
        this.clearWarnings();
        clearTimeout(warningTimeout);
      });
      this.trigger('save', this.model);
      warningTimeout = Util.callAfterTimeout(() => {
        if (!this.options.appState.get('isWaitingForNumberChallenge')) {
          this.showWarning(loc('oktaverify.warning', 'login'));
        }
      }, WARNING_TIMEOUT);
    }
  },
  showError: function(msg) {
    this.clearWarnings();
    this.model.trigger('error', this.model, { responseJSON: { errorSummary: msg } });
  },
  showWarning: function(msg) {
    this.clearWarnings();
    this.add(PushFormwarningTemplate, '.o-form-error-container', { options: { warning: msg } });
  },
  clearWarnings: function() {
    this.$('.okta-form-infobox-warning').remove();
  },
  handleRejectStateChange: function(state, isMfaRejected) {
    if (isMfaRejected) {
      this.setSubmitState(isMfaRejected);
      this.setRejectedErrorMessage();
    }
  },
  setRejectedErrorMessage: function() {
    // If rejection is due to outdated app, show error message per platform
    // else show user rejected message.
    if (this.options.appState.get('lastAuthResponse').factorResultMessage === 'OKTA_VERIFY_UPGRADE_REQUIRED') {
      if (this.options.appState.get('factor').profile.platform === 'IOS') {
        this.showError(loc('oktaverify.rejected.upgradeRequired.ios', 'login'));
      } else {
        this.showError(loc('oktaverify.rejected.upgradeRequired.android', 'login'));
      }
    } else {
      this.showError(loc('oktaverify.rejected', 'login'));
    }
  },
});
