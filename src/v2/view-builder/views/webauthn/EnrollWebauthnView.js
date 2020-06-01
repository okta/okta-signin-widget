import { _, loc, createCallout, createButton } from 'okta';
import BaseForm from '../../internals/BaseForm';
import BaseFactorView from '../shared/BaseFactorView';
import webauthn from '../../../../util/webauthn';
import BrowserFeatures from 'util/BrowserFeatures';
import CryptoUtil from '../../../../util/CryptoUtil';

function getExcludeCredentials (credentials = []) {
  return credentials.map((credential) => {
    return {
      type: 'public-key',
      id: CryptoUtil.strToBin(credential.id),
    };
  });
}

const Body = BaseForm.extend({
  title: loc('oie.enroll.webauthn.title', 'login'),
  className: 'oie-webauthn',
  modelEvents: {
    'error': '_stopEnrollment',
  },
  getUISchema () {
    const schema = [];
    const activationData = this.options.appState.get('currentAuthenticator').contextualData.activationData;
    // Returning custom array so no input fields are displayed for webauthn
    if (webauthn.isNewApiAvailable()) {
      schema.push({
        View: `
          <p class="idx-webauthn-enroll-text">{{i18n code="oie.enroll.webauthn.instructions" bundle="login"}}</p>`,
      });

      if (BrowserFeatures.isEdge()) {
        schema.push({
          View: `
            <p class="idx-webauthn-enroll-text-edge">
              {{i18n code="oie.enroll.webauthn.instructions.edge" bundle="login"}}
            </p>`,
        });
      }

      if (activationData.authenticatorSelection.userVerification === 'required') {
        schema.push({
          View: createCallout({
            className: 'uv-required-callout',
            size: 'slim',
            type: 'warning',
            subtitle: loc('oie.enroll.webauthn.uv.required.instructions', 'login'),
          }),
        });
      }

      schema.push({
        View: '<div data-se="webauthn-waiting" class="okta-waiting-spinner"></div>'
      });
      schema.push({
        View: createButton({
          className: 'webauthn-setup button button-primary button-wide',
          title: loc('oie.enroll.webauthn.save', 'login'),
          click: () => {
            this.triggerWebauthnPrompt();
          }
        }),
      });
    } else {
      schema.push({
        View: createCallout({
          className: 'webauthn-not-supported',
          type: 'error',
          subtitle: loc('oie.enroll.webauthn.error.not.supported', 'login'),
        }),
      });
    }
    return schema;
  },
  triggerWebauthnPrompt () {
    this.$el.find('.o-form-error-container').empty();
    this._startEnrollment();
    const activationData = this.options.appState.get('currentAuthenticator').contextualData.activationData;
    if (webauthn.isNewApiAvailable()) {
      var options = _.extend({}, activationData, {
        challenge: CryptoUtil.strToBin(activationData.challenge),
        user: {
          id: CryptoUtil.strToBin(activationData.user.id),
          name: activationData.user.name,
          displayName: activationData.user.displayName
        },
        excludeCredentials: getExcludeCredentials(activationData.excludeCredentials)
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
        this.saveForm(this.model);
      })
        .catch((error) => {
          this.model.trigger('error', this.model, {responseJSON: {errorSummary: error.message}});
        }).finally(() => {
          this.webauthnAbortController = null;
        });
    }
  },
  _startEnrollment: function () {
    this.$('.okta-waiting-spinner').show();
    this.$('.webauthn-setup').hide();
  },

  _stopEnrollment: function () {
    this.$('.okta-waiting-spinner').hide();
    this.$('.webauthn-setup').show();
  },
});

export default BaseFactorView.extend({
  Body,
  postRender () {
    this.$el.find('.o-form-button-bar [type="submit"]').remove();
  }, 
});
