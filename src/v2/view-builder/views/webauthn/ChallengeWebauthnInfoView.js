import { loc, View, createCallout } from 'okta';

export default View.extend({
  template: '<p class="idx-webauthn-enroll-text">{{i18n code="oie.verify.webauthn.instructions" bundle="login"}}</p>',
  initialize () {
    const challengeData = this.options.appState.get('currentAuthenticatorEnrollment').contextualData.challengeData;
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
});
