import { loc, View, createCallout } from '@okta/courage';
import hbs from '@okta/handlebars-inline-precompile';
import { getWebAuthnAdditionalInstructions } from '../../utils/AuthenticatorUtil';
import WebauthnCustomInstructionsView from './WebauthnCustomInstructionsView';
import { getWebAuthnI18nKey } from 'util/webauthnDisplayNameUtils';

export default View.extend({
  template: hbs`
  {{#if verifyI18nKey}}
    <p class="idx-webauthn-verify-text">{{i18n code=verifyI18nKey bundle="login"}}</p>
  {{else}}
    <p class="idx-webauthn-verify-text">{{i18n code="oie.verify.webauthn.instructions" bundle="login"}}</p>
  {{/if}}`,
  initialize() {
    const relatesToObject = this.options.currentViewState.relatesTo;
    const challengeData = relatesToObject?.value.contextualData.challengeData;
    if (challengeData.userVerification === 'required') {
      this.add(createCallout({
        className: 'uv-required-callout',
        size: 'slim',
        type: 'warning',
        subtitle: loc('oie.verify.webauthn.uv.required.instructions', 'login'),
      }));
    }

    const description = getWebAuthnAdditionalInstructions(this.options.currentViewState);
    if (description) {
      this.add(WebauthnCustomInstructionsView, { options: { description } });
    }

    this.add('<div data-se="webauthn-waiting" class="okta-waiting-spinner"></div>');
  },
  getTemplateData() {
    return {
      verifyI18nKey: getWebAuthnI18nKey({
        DEFAULT: 'oie.verify.webauthn.instructions',
        PASSKEYS: 'oie.verify.webauthn.passkeysRebrand.instructions',
        CUSTOM: 'oie.verify.webauthn.passkeysRebrand.instructions'
      }, this.options.currentViewState.relatesTo?.value?.displayName)
    };
  }
});
