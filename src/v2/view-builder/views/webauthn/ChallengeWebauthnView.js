import { _, loc, createButton, createCallout } from '@okta/courage';
import { BaseForm } from '../../internals';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';
import CryptoUtil from '../../../../util/CryptoUtil';
import webauthn from '../../../../util/webauthn';
import BrowserFeatures from '../../../../util/BrowserFeatures';
import ChallengeWebauthnInfoView from './ChallengeWebauthnInfoView';
import { getMessageFromBrowserError } from '../../../ion/i18nTransformer';
import ChallengeWebauthnFooter from '../../components/ChallengeWebauthnFooter';
import { FORMS as RemediationForms } from '../../../ion/RemediationConstants';
import EnrollWebAuthnResidentKeyLinkView from './EnrollWebAuthnResidentkeyLinkView';

const Body = BaseForm.extend({

  title() {
    return loc('oie.verify.webauth.title', 'login');
  },

  className: 'oie-verify-webauthn',

  getUISchema() {
    const schema = [];
    // Returning custom array so no input fields are displayed for webauthn
    if (webauthn.isNewApiAvailable()) {
      const retryButton = createButton({
        className: 'retry-webauthn button-primary default-custom-button',
        title: loc('mfa.challenge.verify', 'login'),
        click: () => {
          this.getCredentialsAndSave();
        }
      });

      schema.push({
        View: ChallengeWebauthnInfoView,
      }, {
        View: retryButton,
      });
      if (this._canSetupWebAuthnResidentKey()) {
        schema.push({View: EnrollWebAuthnResidentKeyLinkView});
      }
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

  remove() {
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

  getCredentialsAndSave() {
    this.clearErrors();
    this._startVerification();
    // AbortController is not supported in IE11
    if (typeof AbortController !== 'undefined') {
      this.webauthnAbortController = new AbortController();
    }
    const relatesToObject = this.options.currentViewState.relatesTo;
    const authenticatorData = relatesToObject?.value || {};
    const allowCredentials = [];
    const authenticatorEnrollments = this.options.appState.get('authenticatorEnrollments')?.value || [];
    authenticatorEnrollments.forEach((enrollement) => {
      if (enrollement.key === 'webauthn') {
        allowCredentials.push({
          type: 'public-key',
          id: CryptoUtil.strToBin(enrollement.credentialId),
        });
      }
    });
    const challengeData = authenticatorData.contextualData.challengeData;
    const options = _.extend({}, challengeData, {
      allowCredentials,
      challenge: CryptoUtil.strToBin(challengeData.challenge),
    });
    // navigator.credentials() is not supported in IE11
    // eslint-disable-next-line compat/compat
    navigator.credentials.get({
      publicKey: options,
      signal: this.webauthnAbortController && this.webauthnAbortController.signal
    }).then((assertion) => {
      const credentials = {
        clientData: CryptoUtil.binToStr(assertion.response.clientDataJSON),
        authenticatorData: CryptoUtil.binToStr(assertion.response.authenticatorData),
        signatureData: CryptoUtil.binToStr(assertion.response.signature)
      };
      const hasUserHandleSchema = this.options.appState.getSchemaByName('credentials.userHandle');
      if (hasUserHandleSchema) {
        _.extend(credentials, {
          userHandle: CryptoUtil.binToStr(assertion.response.userHandle ?? '')
        });
      }
      
      this.model.set({
        credentials
      });
      this.saveForm(this.model);
    }, (error) => {
      // Do not display if it is abort error triggered by code when switching.
      // this.webauthnAbortController would be null if abort was triggered by code.
      if (this.webauthnAbortController) {
        this.model.trigger('error', this.model, {responseJSON: {errorSummary: getMessageFromBrowserError(error)}});
      }
    }).finally(() => {
      // unset webauthnAbortController on successful authentication or error
      this.webauthnAbortController = null;
    });
  },

  _startVerification: function() {
    this.$('.okta-waiting-spinner').show();
    this.$('.retry-webauthn').hide();
    this.$('.setup-webauthn-residentkey-text').hide();
    this.$('.retry-webauthn')[0].textContent = loc('retry', 'login');
  },

  _stopVerification: function() {
    this.$('.okta-waiting-spinner').hide();
    this.$('.retry-webauthn').show();
    this.$('.setup-webauthn-residentkey-text').show();
  },

  _canSetupWebAuthnResidentKey: function() {
    return this.options.appState.hasRemediationObject(RemediationForms.ENROLL_WEBAUTHN_RESIDENTKEY);
  }
});

export default BaseAuthenticatorView.extend({
  Body,
  Footer: ChallengeWebauthnFooter,
  postRender() {
    BaseAuthenticatorView.prototype.postRender.apply(this, arguments);
    // Trigger browser prompt automatically for other browsers for better UX.
    if (webauthn.isNewApiAvailable() && !BrowserFeatures.isSafari()) {
      this.form.getCredentialsAndSave();
    }
  },
});
