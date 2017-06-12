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

define(['okta', 'util/CookieUtil', 'util/Util'], function (Okta, CookieUtil, Util) {

  var _ = Okta._;
  // deviceName is escaped on BaseForm (see BaseForm's template)
  var titleTpl = Okta.Handlebars.compile('{{factorName}} ({{{deviceName}}})');
  var RETRY_TIMEOUT = 30000; //milliseconds

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
          this.setSubmitState(isMfaTimeout);
          if (isMfaTimeout) {
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
    setSubmitState: function (ableToSubmit, useRetryLabel) {
      var button = this.$el.find('.button');
      this.enabled = ableToSubmit;
      if (ableToSubmit) {
        var buttonString = useRetryLabel ? 'oktaverify.resend' : 'oktaverify.send';
        button.removeClass('link-button-disabled');
        button.prop('value', Okta.loc(buttonString, 'login'));
        button.prop('disabled', false);
      } else {
        button.addClass('link-button-disabled');
        button.prop('value', Okta.loc('oktaverify.sent', 'login'));
        button.prop('disabled', true);
      }
    },
    submit: function (e) {
      if (e !== undefined) {
        e.preventDefault();
      }
      if (this.enabled) {
        this.setSubmitState(false);
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
      var resendTimeout;
      this.clearErrors();
      if (this.model.isValid()) {
        this.listenToOnce(this.model, 'error', function() {
          this.setSubmitState(true);
          clearTimeout(resendTimeout);
        });
        this.trigger('save', this.model);
        resendTimeout = Util.callAfterTimeout(_.bind(function() {
          this.setSubmitState(true, true);
        }, this), RETRY_TIMEOUT);
      }
    },
    showError: function (msg) {
      this.model.trigger('error', this.model, {responseJSON: {errorSummary: msg}});
    }
  });
});
