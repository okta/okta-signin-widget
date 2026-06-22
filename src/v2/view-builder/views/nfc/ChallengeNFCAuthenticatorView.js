/* eslint-disable max-statements */
import { loc, View } from '@okta/courage';
import hbs from '@okta/handlebars-inline-precompile';
import { BaseFormWithPolling, BaseView } from '../../internals';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';
import ScanNfcView from './ScanNFCView';

const BRIDGE_URL = 'http://localhost:3001';

// Parses transactionId and nonce from a setupNfcUrl deep-link.
// Format: om-okta-authenticator:/actions/enroll?...&nonce=<uuid>&command_uri=<encoded-url-with-transactionId>
function parseEnrollParams(setupNfcUrl) {
  const queryStr = setupNfcUrl.split('?').slice(1).join('?');
  const params = new URLSearchParams(queryStr);
  const commandUri = params.get('command_uri') || '';
  const commandParams = new URLSearchParams(commandUri.split('?').slice(1).join('?'));
  return {
    transactionId: commandParams.get('transactionId'),
    nonce: params.get('nonce'),
  };
}

// Decodes a base64url-encoded JWT payload segment (no padding, url-safe alphabet).
function decodeJwtPayload(jwt) {
  const b64 = jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(atob(b64));
}

const Body = BaseFormWithPolling.extend(Object.assign(
  {
    noButtonBar: true,
    className: 'mfa-verify-nfc',

    title() {
      const vendorName = loc('oie.nfc.authenticator.default.vendorName', 'login');
      return loc('oie.verify.nfc.title', 'login', [vendorName]);
    },

    save() {
      return loc('mfa.challenge.verify', 'login');
    },

    async initialize() {
      BaseFormWithPolling.prototype.initialize.apply(this, arguments);
      this.startPolling();
      const container = '.o-form-error-container';

      const appState = this.options.appState?.attributes;
      const isEnroll = appState?.currentFormName === 'enroll-authenticator';

      if (isEnroll) {
        const setupNfcUrl = appState?.currentAuthenticator?.contextualData?.setupNfcUrl;

        if (!setupNfcUrl) {
          // PIN step — card already verified, show requirements and submit button
          this.noButtonBar = false;
          const settings = this.options.currentViewState?.relatesTo?.value?.settings;
          this.displayPinRequirements(settings);
          return;
        }

        this.add(ScanNfcView, container);
        this.hideCodebox = true;

        console.log('[NFC enroll] setupNfcUrl:', setupNfcUrl);

        const { transactionId, nonce } = parseEnrollParams(setupNfcUrl);
        if (!transactionId) {
          console.error('[NFC enroll] Could not parse transactionId from setupNfcUrl');
          return;
        }
        console.log('[NFC enroll] transactionId:', transactionId, 'nonce:', nonce);

        const res = await window.fetch(`${BRIDGE_URL}/enroll`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transactionId, nonce }),
        });
        const response = await res.json();

        console.log('[NFC enroll] bridge response:', response);
        if (response?.success) {
          this.options.appState.trigger('hideScanNfc');
          this.noButtonBar = false;
          this.hideCodebox = false;
          this.render();
        }

      } else {
        // Verify flow — find the challenge JWT and extract jti as transactionId.
        // The JWT arrives in currentAuthenticatorEnrollment.contextualData as part of the
        // device challenge href: com-okta-authenticator:///deviceChallenge?challengeRequest=<jwt>
        const ctxData = appState?.currentAuthenticatorEnrollment?.contextualData || {};
        console.log('[NFC verify] contextualData:', JSON.stringify(ctxData));

        const challengeHref = ctxData?.authenticatorChallenge?.href
          || ctxData?.href
          || '';
        const challengeRequest = new URLSearchParams(
          challengeHref.split('?').slice(1).join('?')
        ).get('challengeRequest');

        let transactionId;
        let nonce;
        if (challengeRequest) {
          try {
            const payload = decodeJwtPayload(challengeRequest);
            transactionId = payload.jti;
            nonce = payload.nonce;
            console.log('[NFC verify] decoded JWT payload:', payload);
          } catch (e) {
            console.error('[NFC verify] Failed to decode challengeRequest JWT', e);
          }
        }

        if (!transactionId) {
          console.error('[NFC verify] Could not determine transactionId. contextualData:', ctxData);
          return;
        }
        console.log('[NFC verify] transactionId:', transactionId, 'nonce:', nonce);

        const verifyRes = await window.fetch(`${BRIDGE_URL}/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transactionId, nonce }),
        });
        const response = await verifyRes.json();

        console.log('[NFC verify] bridge response:', response);
        if (response?.success) {
          this.options.appState.trigger('hideScanNfc');
          this.noButtonBar = false;
          this.hideCodebox = false;
          this.model.set('credentials.externalId', transactionId);
          this.render();
        }
      }
    },

    postRender() {
      if (this.hideCodebox) {
        const codeBox = this.$el.find('.o-form-fieldset-container');
        codeBox.addClass('hide');
      }
    },

    displayPinRequirements(settings) {
      const minLength = settings?.minLength ?? 4;
      const maxLength = settings?.maxLength ?? 6;
      const rules = [
        loc('oie.nfc.pin.requirement.length', 'login', [minLength, maxLength]),
        loc('oie.nfc.pin.requirement.numeric', 'login'),
      ];
      this.add(
        View.extend({
          tagName: 'section',
          template: hbs`
            <div class="password-authenticator--heading">
              {{i18n code="oie.nfc.pin.requirements.header" bundle="login"}}
            </div>
            <ul class="password-authenticator--list">
              {{#each rules}}<li>{{this}}</li>{{/each}}
            </ul>`,
          getTemplateData: () => ({ rules }),
          attributes: { 'data-se': 'nfc-pin-authenticator--rules' },
        }),
        { prepend: true, selector: '.o-form-fieldset-container' },
      );
    },

    getUISchema() {
      const uiSchemas = BaseFormWithPolling.prototype.getUISchema.apply(this, arguments);
      const confirmPin = {
        name: 'credentials.oldPasscode',
        label: loc('oie.nfc.pin.confirmPinLabel', 'login'),
        type: 'password',
        'label-top': true,
      };

      const updatedSchema = [];
      for (const field of uiSchemas) {
        updatedSchema.push(field);
        if (field.name === 'credentials.passcode') {
          updatedSchema.push(confirmPin);
        }
      }
      return updatedSchema;
    },

    remove() {
      this.stopPolling();
      BaseFormWithPolling.prototype.remove.apply(this, arguments);
    },
  },
));

export default BaseAuthenticatorView.extend({
  Body,

  createModelClass() {
    const ModelClass = BaseView.prototype.createModelClass.apply(this, arguments);
    return ModelClass.extend({
      validate() {
        if (this.get('credentials.passcode') !== this.get('credentials.oldPasscode')) {
          return {
            'credentials.oldPasscode': loc('oie.nfc.pin.match.error', 'login'),
          };
        }
        return null;
      },
    });
  },
});
