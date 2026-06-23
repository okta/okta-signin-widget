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
      const appState = this.options.appState?.attributes;
      const isEnroll = appState?.currentFormName === 'enroll-authenticator';
      const isPinStep = isEnroll
        ? !appState?.currentAuthenticator?.contextualData?.setupNfcUrl
        : !this.options.currentViewState?.relatesTo?.value?.contextualData?.challenge;
      if (isPinStep) {
        return loc('oie.verify.nfc.pin.title', 'login');
      }
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
        // Verify flow — read contextualData first to determine which step we're on.
        const ctxData = this.options.currentViewState?.relatesTo?.value?.contextualData
          || appState?.currentAuthenticatorEnrollment?.contextualData
          || {};

        // PIN step: server has advanced past card scan (no challenge JWT in response).
        if (!ctxData?.challenge) {
          this.noButtonBar = false;
          this.hideCodebox = false;
          return;
        }

        // Card step: bridge already called on a prior render — wait for server to transition.
        if (this.model.get('credentials.externalId')) {
          return;
        }

        // Card step: extract the challenge JWT and call the bridge.
        console.log('[NFC verify] contextualData:', JSON.stringify(ctxData));

        const challengeHref = ctxData?.challenge?.value?.href || '';
        const challengeRequest = new URLSearchParams(
          challengeHref.split('?').slice(1).join('?')
        ).get('challengeRequest');

        let transactionId;
        let nonce;
        let commandUri;
        if (challengeRequest) {
          try {
            const payload = decodeJwtPayload(challengeRequest);
            transactionId = payload.jti;
            nonce = payload.nonce;
            commandUri = payload.commandUri;
            console.log('[NFC verify] decoded JWT payload:', payload);
          } catch (e) {
            console.error('[NFC verify] Failed to decode challengeRequest JWT', e);
          }
        }

        if (!transactionId) {
          console.error('[NFC verify] Could not determine transactionId. contextualData:', ctxData);
          return;
        }
        console.log('[NFC verify] transactionId:', transactionId, 'nonce:', nonce, 'commandUri:', commandUri);

        this.add(ScanNfcView, container);
        this.hideCodebox = true;

        const verifyRes = await window.fetch(`${BRIDGE_URL}/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transactionId, nonce, commandUri }),
        });
        const response = await verifyRes.json();

        console.log('[NFC verify] bridge response:', response);
        if (response?.success) {
          this.options.appState.trigger('hideScanNfc');
          this.model.set('credentials.externalId', transactionId);
          this.noButtonBar = false;
          this.hideCodebox = false;
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
      const isEnroll = this.options.appState?.attributes?.currentFormName === 'enroll-authenticator';
      if (!isEnroll) {
        return uiSchemas;
      }

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
        const oldPasscode = this.get('credentials.oldPasscode');
        if (oldPasscode !== undefined && this.get('credentials.passcode') !== oldPasscode) {
          return {
            'credentials.oldPasscode': loc('oie.nfc.pin.match.error', 'login'),
          };
        }
        return null;
      },
    });
  },
});
