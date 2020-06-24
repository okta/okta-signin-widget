import { loc, _, createButton } from 'okta';
import BaseForm from '../../internals/BaseForm';
import BaseFooter from '../../internals/BaseFooter';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';
import CryptoUtil from '../../../../util/CryptoUtil';
import webauthn from '../../../../util/webauthn';

const Body = BaseForm.extend({

  title () {
    return loc('factor.webauthn.biometric', 'login');
  },

  getUISchema () {
    const schema = [];
    // Returning custom array so no input fields are displayed for webauthn
    if (webauthn.isNewApiAvailable()) {
      const retryButton = createButton({
        className: 'retry-webauthn button-primary default-custom-button',
        title: loc('retry', 'login'),
        click: () => {
          this.getCredentialsAndSave();
        }
      });

      schema.push({
        View:
            '<div class="webauthn-verify-text idx-webauthn-verify-text">\
              <p>{{i18n code="verify.webauthn.biometric.instructions" bundle="login"}}</p>\
              <div data-se="webauthn-waiting" class="okta-waiting-spinner"></div>\
            </div>'
      }, {
        View: retryButton,
      });
    }
    return schema;
  },

  remove () {
    BaseForm.prototype.remove.apply(this, arguments);
    if (this.webauthnAbortController) {
      this.webauthnAbortController.abort();
      this.webauthnAbortController = null;
    }
  },

  noButtonBar: true,

  modelEvents: {
    'error': '_stopVerification'
  },

  getCredentialsAndSave () {
    this.clearErrors();
    this._startVerification();
    this.webauthnAbortController = new AbortController();
    const factor = this.options.appState.get('factor');
    const allowCredentials = [{
      type: 'public-key',
      id: CryptoUtil.strToBin(factor.contextualData.profile.credentialId)
    }];
    const options = {
      allowCredentials,
      challenge: CryptoUtil.strToBin(factor.contextualData.challengeData.challenge)
    };
    navigator.credentials.get({
      publicKey: options,
      signal: this.webauthnAbortController.signal
    }).then((assertion) => {
      this.model.set({
        credentials : {
          clientData: CryptoUtil.binToStr(assertion.response.clientDataJSON),
          authenticatorData: CryptoUtil.binToStr(assertion.response.authenticatorData),
          signatureData: CryptoUtil.binToStr(assertion.response.signature),
        }
      });
      this.saveForm(this.model);
    }, (error) => {
      // Do not display if it is abort error triggered by code when switching.
      // this.webauthnAbortController would be null if abort was triggered by code.
      if (this.webauthnAbortController) {
        this.model.trigger('error', this.model, { responseJSON: { errorSummary: error.message } });
      }
    }).finally(() => {
      // unset webauthnAbortController on successful authentication or error
      this.webauthnAbortController = null;
    });
  },

  postRender: function () {
    _.defer(() => {
      if (webauthn.isNewApiAvailable()) {
        this.getCredentialsAndSave();
      }
      else {
        this.model.trigger('error', this.model, {
          responseJSON: {
            errorSummary: loc('webauthn.biometric.error.factorNotSupported', 'login')
          }
        });
        this.$('[data-se="webauthn-waiting"]').hide();
      }
    });
  },

  _startVerification: function () {
    this.$('.okta-waiting-spinner').show();
    this.$('.retry-webauthn').hide();
  },

  _stopVerification: function () {
    this.$('.okta-waiting-spinner').hide();
    this.$('.retry-webauthn').show();
  }
});

const Footer = BaseFooter.extend({
  links: function () {
    // recovery link
    const links = [];

    // check if we have a select-factor form in remediation, if so add a link
    if (this.options.appState.hasRemediationObject('select-factor')) {
      links.push({
        'type': 'link',
        'label': loc('mfa.switch', 'login'),
        'name': 'switchFactor',
        'formName': 'select-factor',
      });
    }
    return links;
  }
});

export default BaseAuthenticatorView.extend({
  Body,
  Footer,
});
