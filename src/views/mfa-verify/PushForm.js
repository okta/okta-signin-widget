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

define(['okta', 'util/CookieUtil'], function (Okta, CookieUtil) {

  var SUBMIT_STATE = {
    DISABLED: 0, // false
    ENABLED: 1, // true
    ENABLED_RETRY: 2 // true
  };

  var _ = Okta._;
  // deviceName is escaped on BaseForm (see BaseForm's template)
  var titleTpl = Okta.Handlebars.compile('{{factorName}} ({{{deviceName}}})');

  return Okta.Form.extend({
    className: 'mfa-verify-push',
    autoSave: true,
    noCancelButton: true,
    save: _.partial(Okta.loc, 'oktaverify.send', 'login'),
    scrollOnError: false,
    layout: 'o-form-theme',
    attributes: { 'data-se': 'factor-push' },
    events: {
      submit: 'submit'
    },

    initialize: function () {
      this.enabled = true;
      this.listenTo(this.options.appState, 'change:isMfaRejectedByUser',
        function (state, isMfaRejectedByUser) {
          this.setSubmitState(isMfaRejectedByUser);
          if (isMfaRejectedByUser) {
            this.showError(Okta.loc('oktaverify.rejected', 'login'));
          }
        }
      );
      this.listenTo(this.options.appState, 'change:isMfaTimeout',
        function (state, isMfaTimeout) {
          if (isMfaTimeout) {
            this.setSubmitState(state.isMfaChallenge ? SUBMIT_STATE.ENABLED : SUBMIT_STATE.ENABLED_RETRY);
          }
          else {
            this.setSubmitState(SUBMIT_STATE.DISABLED);
          }

          if (state.isMfaChallenge && isMfaTimeout) {
            this.showError(Okta.loc('oktaverify.timeout', 'login'));
          }
        }
      );
      this.listenTo(this.options.appState, 'change:isMfaRequired',
        function (state, isMfaRequired) {
          if (isMfaRequired) {
            this.clearErrors();
          }
        }
      );
      this.title = titleTpl({
        factorName: this.model.get('factorLabel'),
        deviceName: this.model.get('deviceName')
      });
    },
    setSubmitState: function (submitState) {
      var button = this.$el.find('.button');
      this.enabled = !!submitState;

      switch (submitState) {
      case SUBMIT_STATE.DISABLED:
        button.addClass('link-button-disabled');
        button.prop('value', Okta.loc('oktaverify.sent', 'login'));
        button.prop('disabled', true);
        break;
      case SUBMIT_STATE.ENABLED:
        button.removeClass('link-button-disabled');
        button.prop('value', Okta.loc('oktaverify.send', 'login'));
        button.prop('disabled', false);
        break;
      case SUBMIT_STATE.ENABLED_RETRY:
        button.removeClass('link-button-disabled');
        button.prop('value', Okta.loc('oktaverify.resend', 'login'));
        button.prop('disabled', false);
      }
    },
    submit: function (e) {
      if (e !== undefined) {
        e.preventDefault();
      }
      if (this.enabled) {
        this.setSubmitState(SUBMIT_STATE.DISABLED);
        this.doSave();
      }
    },
    postRender: function() {
      if (this.settings.get('features.autoPush') && CookieUtil.isAutoPushEnabled(this.options.appState.get('userId'))) {
        this.model.set('autoPush', true);
        // bind after $el has been rendered, and trigger push once DOM is fully loaded
        _.defer(_.bind(this.submit, this));
      }
    },
    doSave: function () {
      this.clearErrors();
      if (this.model.isValid()) {
        this.listenToOnce(this.model, 'error', this.setSubmitState, SUBMIT_STATE.ENABLED);
        this.trigger('save', this.model);
      }
    },
    showError: function (msg) {
      this.model.trigger('error', this.model, {responseJSON: {errorSummary: msg}});
    }
  });
});
