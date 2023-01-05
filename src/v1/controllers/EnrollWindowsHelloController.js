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

import { _, loc } from '@okta/courage';
import FormController from 'v1/util/FormController';
import FormType from 'v1/util/FormType';
import webauthn from 'util/webauthn';
import Footer from 'v1/views/enroll-factors/Footer';
import HtmlErrorMessageView from 'v1/views/mfa-verify/HtmlErrorMessageView';
import Spinner from 'v1/views/shared/Spinner';
export default FormController.extend({
  className: 'enroll-windows-hello',
  Model: {
    local: {
      __isEnrolled__: 'boolean',
    },

    save: function() {
      if (!webauthn.isAvailable()) {
        return;
      }

      this.trigger('request');

      if (this.get('__isEnrolled__')) {
        return this.activate();
      }

      return this.doTransaction(function(transaction) {
        return this._enroll(transaction);
      });
    },

    _enroll: function(transaction) {
      const factor = _.findWhere(transaction.factors, {
        factorType: 'webauthn',
        provider: 'FIDO',
      });

      return factor.enroll();
    },

    activate: function() {
      this.set('__isEnrolled__', true);

      return this.doTransaction(function(transaction) {
        const activation = transaction.factor.activation;
        const user = transaction.user;
        const model = this;
        const accountInfo = {
          rpDisplayName: activation.rpDisplayName,
          userDisplayName: user.profile.displayName,
          accountName: user.profile.login,
          userId: user.id,
        };
        const cryptoParams = [
          {
            algorithm: activation.algorithm,
          },
        ];
        const challenge = activation.nonce;

        return webauthn
          .makeCredential(accountInfo, cryptoParams, challenge)
          .then(function(creds) {
            return transaction.activate({
              credentialId: creds.credential.id,
              publicKey: creds.publicKey,
              attestation: null,
            });
          })
          .catch(function(error) {
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
    },
  },

  Form: {
    autoSave: true,
    hasSavingState: false,
    title: _.partial(loc, 'enroll.windowsHello.title', 'login'),
    subtitle: function() {
      return webauthn.isAvailable() ? loc('enroll.windowsHello.subtitle', 'login') : '';
    },
    save: _.partial(loc, 'enroll.windowsHello.save', 'login'),

    customSavingState: {
      stop: 'abort',
    },

    modelEvents: function() {
      if (!webauthn.isAvailable()) {
        return {};
      }

      return {
        request: '_startEnrollment',
        error: '_stopEnrollment',
        abort: '_stopEnrollment',
      };
    },

    noButtonBar: function() {
      return !webauthn.isAvailable();
    },

    formChildren: function() {
      const result = [];

      if (!webauthn.isAvailable()) {
        result.push(
          FormType.View(
            { View: new HtmlErrorMessageView({ message: loc('enroll.windowsHello.error.notWindows', 'login') }) },
            { selector: '.o-form-error-container' }
          )
        );
      }

      result.push(FormType.View({ View: new Spinner({ model: this.model, visible: false }) }));

      return result;
    },

    _startEnrollment: function() {
      this.subtitle = loc('enroll.windowsHello.subtitle.loading', 'login');

      this.model.trigger('spinner:show');
      this._resetErrorMessage();

      this.render();
      this.$('.o-form-button-bar').addClass('hide');
    },

    _stopEnrollment: function(errorMessage) {
      this.subtitle = loc('enroll.windowsHello.subtitle', 'login');

      this.model.trigger('spinner:hide');

      let message;

      switch (errorMessage) {
      case 'NotSupportedError':
        message = loc('enroll.windowsHello.error.notConfiguredHtml', 'login');
        break;
      }

      this._resetErrorMessage();

      if (message) {
        const messageView = new HtmlErrorMessageView({
          message: message,
        });

        this.$('.o-form-error-container').addClass('o-form-has-errors');
        this.add(messageView, { selector: '.o-form-error-container' });
        this._errorMessageView = this.last();
      }

      this.render();
      this.$('.o-form-button-bar').removeClass('hide');
    },

    _resetErrorMessage: function() {
      this._errorMessageView && this._errorMessageView.remove();
      this._errorMessageView = undefined;
      this.clearErrors();
    },
  },

  Footer: Footer,

  trapAuthResponse: function() {
    if (this.options.appState.get('isMfaEnrollActivate')) {
      this.model.activate();
      return true;
    }
  },
});
