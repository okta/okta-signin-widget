import { loc, View, createCallout } from 'okta';
import hbs from 'handlebars-inline-precompile';

export default View.extend({
  // eslint-disable-next-line max-len
  //template: hbs`<p class="idx-webauthn-verify-text">{{i18n code="oie.verify.webauthn.instructions" bundle="login"}}</p>`,
  initialize() {
    const relatesToObject = this.options.currentViewState.relatesTo;
    const challengeData = relatesToObject?.value.contextualData.challengeData;
    let instructions = loc('oie.verify.webauthn.instructions', 'login');
    if(this._isOnePass()) {
      instructions = 'You will be prompted to use a Touch ID. Follow the instructions to complete verification.';
    }
    this.add(instructions);
    if (challengeData.userVerification === 'required') {
      this.add(createCallout({
        className: 'uv-required-callout',
        size: 'slim',
        type: 'warning',
        subtitle: loc('oie.verify.webauthn.uv.required.instructions', 'login'),
      }));
    }
    this.add('<div data-se="webauthn-waiting" class="okta-waiting-spinner"></div>');
  },
  _isOnePass: function() {
    return this.options.currentViewState.relatesTo?.value.contextualData.onePass?.isEnabled;
  },
});
