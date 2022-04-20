import { _, loc, createCallout, createButton } from 'okta';
import { BaseForm, BaseFooter } from '../../internals';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';
import webauthn from '../../../../util/webauthn';
import CryptoUtil from '../../../../util/CryptoUtil';
import EnrollWebauthnInfoView from './EnrollWebauthnInfoView';
import { getMessageFromBrowserError } from '../../../ion/i18nTransformer';
import { getSkipSetupLink } from '../../utils/LinksUtil';
import { FORMS as RemediationForms } from '../../../ion/RemediationConstants';
import Link from '../../components/Link';
import CookieUtil from 'util/CookieUtil';
import cbor from '../../../../util/cbor';
import base64url from '../../../../util/base64url';

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
    return this._isOnePass() ? 'Enable Touch ID' : loc('oie.enroll.webauthn.title', 'login');
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
          title: this._isOnePass() ? 'Enable' : loc('oie.enroll.webauthn.save', 'login'),
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
          subtitle: loc('oie.webauthn.error.not.supported', 'login'),
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
    console.log('start webauthn');
    let excludeCredentials = getExcludeCredentials(this.options.appState.get('authenticatorEnrollments').value);
    let userId = CryptoUtil.strToBin(activationData.user.id);
    if(this._isOnePass()) {
      const prefix = 'o_' + Date.now() + '_';
      userId = CryptoUtil.rawStrToBin(prefix + activationData.user.id);
      excludeCredentials = [];
    }
    if (webauthn.isNewApiAvailable()) {
      var options = _.extend({}, activationData, {
        challenge: CryptoUtil.strToBin(activationData.challenge),
        user: {
          id: userId,
          name: activationData.user.name,
          displayName: activationData.user.displayName
        },
        excludeCredentials,
      });
      this.webauthnAbortController = new AbortController();
      navigator.credentials.create({
        publicKey: options,
        signal: this.webauthnAbortController.signal
      }).then((newCredential) => {
        this.model.set({
          credentials : {
            clientData: CryptoUtil.binToStr(newCredential.response.clientDataJSON),
            attestation: CryptoUtil.binToStr(newCredential.response.attestationObject),
          }
        });
        if(this._isOnePass()) {
          CookieUtil.setOnePassEnrollmentHint(newCredential.id);

          const decodedAttestationObj = cbor.decode(newCredential.response.attestationObject);
          const {authData} = decodedAttestationObj;
          const aaguid = authData.slice(37,53);
          const aaguidAscii = base64url.encode(aaguid);
          CookieUtil.setOnePassWebAuthnAAGUID(aaguidAscii);
          console.log('aaguid: ' + aaguidAscii);
        }
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
  _isOnePass: function() {
    return this.options.currentViewState.relatesTo?.value.contextualData.onePass?.isEnabled;
  }
});

const onePassFooter = BaseFooter.extend({
  hasBackToSignInLink: false,
  initialize() {
    const appState = this.options.appState;
    if (appState.hasRemediationObject(RemediationForms.SKIP)) {
      this.add(Link, {
        options: {
          type: 'link',
          name: 'skip-setup',
          label: 'Maybe Later',
          clickHandler: () => {
            CookieUtil.setOnePassEnrollmentHint('');
            appState.trigger('invokeAction', RemediationForms.SKIP);
          },
      }})
      this.add(Link, {
        options: {
          type: 'link',
          name: 'skip-setup',
          label: 'Do not ask me again',
          clickHandler: () => {
            CookieUtil.setOnePassEnrollmentHint('declined');
            appState.trigger('invokeAction', RemediationForms.SKIP);
          },
      }})
    }
  }
});

export default BaseAuthenticatorView.extend({
  Body,
  postRender() {
    BaseAuthenticatorView.prototype.postRender.apply(this, arguments);
    this.$el.find('.o-form-button-bar [type="submit"]').remove();
  },
  initialize() {
    if(this._isOnePass()){
      this.Footer = onePassFooter;
    }
  },
  _isOnePass: function() {
    return this.options.currentViewState.relatesTo?.value.contextualData.onePass?.isEnabled;
  }
});
