import { loc, createButton, createCallout } from 'okta';
import BaseForm from '../../internals/BaseForm';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';
import CryptoUtil from '../../../../util/CryptoUtil';
import webauthn from '../../../../util/webauthn';
import AuthenticatorVerifyFooter from '../../components/AuthenticatorVerifyFooter';
import ChallengeWebauthnInfoView from './ChallengeWebauthnInfoView';

const Body = BaseForm.extend({

  title () {
    return loc('oie.verify.webauth.title', 'login');
  },

  className: 'oie-verify-webauthn',

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
        View: ChallengeWebauthnInfoView,
      }, {
        View: retryButton,
      });
    } else {
      schema.push({
        View: createCallout({
          className: 'webauthn-not-supported',
          type: 'error',
          subtitle: loc('oie.webauthn.error.not.supported', 'login'),
        }),
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
    const relatesToObject = this.options.currentViewState.relatesTo;
    const authenticatorData = relatesToObject?.value || {};
    const allowCredentials = [];
    const authenticatorEnrollments = this.options.appState.get('authenticatorEnrollments').value || [];
    authenticatorEnrollments.forEach((enrollement) => {
      if (enrollement.type === 'security_key') {
        allowCredentials.push({
          type: 'public-key',
          id: CryptoUtil.strToBin(enrollement.credentialId),
        });
      }
    });
    const options = {
      allowCredentials,
      userVerification: authenticatorData.contextualData.challengeData.userVerification,
      challenge: CryptoUtil.strToBin(authenticatorData.contextualData.challengeData.challenge),
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

  _startVerification: function () {
    this.$('.okta-waiting-spinner').show();
    this.$('.retry-webauthn').hide();
  },

  _stopVerification: function () {
    this.$('.okta-waiting-spinner').hide();
    this.$('.retry-webauthn').show();
  }
});

export default BaseAuthenticatorView.extend({
  Body,
  Footer: AuthenticatorVerifyFooter,
  postRender () {
    BaseAuthenticatorView.prototype.postRender.apply(this, arguments);
    if (webauthn.isNewApiAvailable()) {
      this.form.getCredentialsAndSave();
    }
  },
});
