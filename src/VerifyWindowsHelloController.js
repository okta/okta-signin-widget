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

define([
  'okta',
  'util/FormController',
  'util/FormType',
  'util/webauthn',
  'views/shared/Spinner',
  'views/shared/FooterSignout',
  'views/mfa-verify/HtmlErrorMessageView'
],
function (Okta, FormController, FormType, webauthn, Spinner, FooterSignout, HtmlErrorMessageView) {

  var _ = Okta._;

  return FormController.extend({
    className: 'mfa-verify verify-windows-hello',
    Model: {
      local: {
        __autoTriggered__: 'boolean'
      },

      save: function () {
        if (!webauthn.isAvailable()) {
          return;
        }

        this.trigger('request');
        var model = this;

        return this.doTransaction(function (transaction) {
          var factor = _.findWhere(transaction.factors, {
            factorType: 'webauthn',
            provider: 'FIDO'
          });

          return factor.verify()
          .then(function (verifyData) {
            var factorData = verifyData.factor;

            return webauthn.getAssertion(
              factorData.challenge.nonce,
              [{ id: factorData.profile.credentialId }]
            )
            .then(function (assertion) {
              return factor.verify({
                authenticatorData: assertion.authenticatorData,
                clientData: assertion.clientData,
                signatureData: assertion.signature
              });
            })
            .then(function (data) {
              model.trigger('sync');
              model.trigger('signIn');
              return data;
            })
            .fail(function (error) {
              switch (error.message) {
              case 'AbortError':
              case 'NotFoundError':
              case 'NotSupportedError':
                model.trigger('abort', error.message);
                return transaction;
              }

              throw error;
            });
          });
        });
      }
    },

    Form: {
      autoSave: true,
      hasSavingState: false,
      title: _.partial(Okta.loc, 'factor.windowsHello', 'login'),
      subtitle: function () {
        return webauthn.isAvailable() ? Okta.loc('verify.windowsHello.subtitle', 'login') : '';
      },
      save: _.partial(Okta.loc, 'verify.windowsHello.save', 'login'),

      customSavingState:{
        stop: 'abort'
      },

      modelEvents: function () {
        if (!webauthn.isAvailable()) {
          return {};
        }

        return {
          'request': '_startEnrollment',
          'error': '_stopEnrollment',
          'abort': '_stopEnrollment',
          'signIn': '_successEnrollment'
        };
      },

      noButtonBar: function () {
        return !webauthn.isAvailable();
      },

      formChildren: function () {
        var result = [];
        if (!webauthn.isAvailable()) {
          result.push(
            FormType.View(
              { View: new HtmlErrorMessageView(
                { message: Okta.loc('enroll.windowsHello.error.notWindows', 'login') })},
              { selector: '.o-form-error-container' }
            )
          );
        }

        result.push(FormType.View({ View: new Spinner({ model: this.model, visible: false }) }));

        return result;
      },

      postRender: function () {
        if (this.options.appState.get('factors').length === 1 && !this.model.get('__autoTriggered__')) {
          this.model.set('__autoTriggered__', true);
          this.model.save();
        }
      },

      _startEnrollment: function () {
        this.subtitle = Okta.loc('verify.windowsHello.subtitle.loading', 'login');

        this.model.trigger('spinner:show');
        this._resetErrorMessage();

        this.render();
        this.$('.o-form-button-bar').addClass('hide');
      },


      _stopEnrollment: function (errorMessage) {
        this.subtitle = Okta.loc('verify.windowsHello.subtitle', 'login');

        this.model.trigger('spinner:hide');
        this.$('.o-form-button-bar').removeClass('hide');

        var message;
        switch (errorMessage) {
        case 'NotFoundError':
          message = this.options.appState.get('factors').length > 1 ?
            Okta.loc('verify.windowsHello.error.notFound.selectAnother', 'login') :
            Okta.loc('verify.windowsHello.error.notFound', 'login');
          break;

        case 'NotSupportedError':
          message = Okta.loc('enroll.windowsHello.error.notConfiguredHtml', 'login');
          break;
        }

        this._resetErrorMessage();

        if (message) {
          var messageView = new HtmlErrorMessageView({
            message: message
          });

          this.$('.o-form-error-container').addClass('o-form-has-errors');
          this.add(messageView, {selector: '.o-form-error-container'});
          this._errorMessageView = this.last();
        }

        this.render();
      },

      _successEnrollment: function () {
        this.subtitle = Okta.loc('verify.windowsHello.subtitle.signingIn', 'login');
        this.render();
        this.$('.o-form-button-bar').addClass('hide');
      },

      _resetErrorMessage: function () {
        this._errorMessageView && this._errorMessageView.remove();
        this._errorMessageView = undefined;
        this.clearErrors();
      }
    },

    back: function() {
      // Empty function on verify controllers to prevent users
      // from navigating back during 'verify' using the browser's
      // back button. The URL will still change, but the view will not
      // More details in OKTA-135060.
    },

    Footer: FooterSignout
  });

});
