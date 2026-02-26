import { _, loc, createCallout, createButton } from '@okta/courage';
import { BaseForm } from '../../internals';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';
import webauthn from 'util/webauthn';
import CryptoUtil from 'util/CryptoUtil';
import EnrollWebauthnInfoView from './EnrollWebauthnInfoView';
import { getMessageFromBrowserError } from '../../../ion/i18nTransformer';
import { getWebAuthnTitle } from '../../utils/AuthenticatorUtil';
import { getWebAuthnI18nKey } from 'util/webauthnDisplayNameUtils';

function getExcludeCredentials(authenticatorEnrollments = []) {
  const credentials = [];
  authenticatorEnrollments.forEach((enrollement) => {
    if (enrollement.key === 'webauthn') {
      credentials.push({
        type: 'public-key',
        id: CryptoUtil.strToBin(enrollement.credentialId),
      });
    }
  });
  return credentials;
}

const Body = BaseForm.extend({
  title() {
    return getWebAuthnTitle(this.options.currentViewState, false);
  },
  className: 'oie-enroll-webauthn',
  modelEvents: {
    'error': '_stopEnrollment',
  },
  getUISchema() {
    const schema = [];
    // Returning custom array so no input fields are displayed for webauthn
    if (webauthn.isNewApiAvailable()) {
      schema.push({
        View: EnrollWebauthnInfoView,
      });
      schema.push({
        View: createButton({
          className: 'webauthn-setup button button-primary button-wide',
          title: loc('oie.enroll.webauthn.save', 'login'),
          click: () => {
            this.triggerWebauthnPrompt();
          },
        }),
      });
    } else {
      schema.push({
        View: createCallout({
          className: 'webauthn-not-supported',
          type: 'error',
          subtitle: getWebAuthnI18nKey({
            DEFAULT: loc('oie.webauthn.error.not.supported', 'login'),
            PASSKEYS: loc('oie.webauthn.passkeysRebrand.error.not.supported', 'login'),
            CUSTOM: loc('oie.webauthn.passkeysRebrand.error.not.supported', 'login')
          }, this.options.currentViewState.relatesTo?.value?.displayName),
        }),
      });
    }
    return schema;
  },
  triggerWebauthnPrompt() {
    this.$el.find('.o-form-error-container').empty();
    this._startEnrollment();
    const relatesToObject = this.options.currentViewState.relatesTo;
    const activationData = relatesToObject?.value.contextualData.activationData;
    if (webauthn.isNewApiAvailable()) {
      const excludeCredentials = activationData.authenticatorSelection?.requireResidentKey === true ?
        [] :
        getExcludeCredentials(this.options.appState.get('authenticatorEnrollments').value);
      const options = _.extend({}, activationData, {
        challenge: CryptoUtil.strToBin(activationData.challenge),
        user: {
          id: CryptoUtil.strToBin(activationData.user.id),
          name: activationData.user.name,
          displayName: activationData.user.displayName
        },
        excludeCredentials
      });
      // AbortController is not supported in IE11
      if (typeof AbortController !== 'undefined') {
        this.webauthnAbortController = new AbortController();
      }
      navigator.credentials.create({
        publicKey: options,
        signal: this.webauthnAbortController && this.webauthnAbortController.signal
      }).then((newCredential) => {
        this.model.set({
          credentials : {
            clientData: CryptoUtil.binToStr(newCredential.response.clientDataJSON),
            attestation: CryptoUtil.binToStr(newCredential.response.attestationObject),
            // example data: ["nfc", "usb"]
            transports: webauthn.processWebAuthnResponse(newCredential.response.getTransports, newCredential.response),
            // example data: {"credProps":{"rk":true}}
            clientExtensions: webauthn.processWebAuthnResponse(newCredential.getClientExtensionResults, newCredential)
          }
        });
        this.saveForm(this.model);
      })
        .catch((error) => {
          this.model.trigger('error', this.model, {responseJSON: {errorSummary: getMessageFromBrowserError(error)}});
        }).finally(() => {
          this.webauthnAbortController = null;
        });
    }
  },
  _startEnrollment: function() {
    this.$('.okta-waiting-spinner').show();
    this.$('.webauthn-setup').hide();
  },

  _stopEnrollment: function() {
    this.$('.okta-waiting-spinner').hide();
    this.$('.webauthn-setup').show();
  },
});

export default BaseAuthenticatorView.extend({
  Body,
  postRender() {
    BaseAuthenticatorView.prototype.postRender.apply(this, arguments);
    this.$el.find('.o-form-button-bar [type="submit"]').remove();
  },
});
