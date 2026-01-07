import { loc, View, createCallout } from '@okta/courage';
import hbs from '@okta/handlebars-inline-precompile';
import { getWebAuthnAdditionalInstructions } from '../../utils/AuthenticatorUtil';
import WebauthnCustomInstructionsView from './WebauthnCustomInstructionsView';

export default View.extend({
  // eslint-disable-next-line max-len
  template: hbs`<p class="idx-webauthn-verify-text">{{i18n code="oie.verify.webauthn.instructions" bundle="login"}}</p>`,
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
});
