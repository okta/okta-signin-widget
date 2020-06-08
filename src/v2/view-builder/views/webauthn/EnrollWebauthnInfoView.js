import { loc, View, createCallout } from 'okta';
import BrowserFeatures from 'util/BrowserFeatures';

export default View.extend({
  template: '<p class="idx-webauthn-enroll-text">{{i18n code="oie.enroll.webauthn.instructions" bundle="login"}}</p>',
  initialize () {
    const activationData = this.options.appState.get('currentAuthenticator').contextualData.activationData;
    if (BrowserFeatures.isEdge()) {
      this.add(`
        <p class="idx-webauthn-enroll-text-edge">
          {{i18n code="oie.enroll.webauthn.instructions.edge" bundle="login"}}
        </p>`);
    }
    if (activationData.authenticatorSelection.userVerification === 'required') {
      this.add(createCallout({
        className: 'uv-required-callout',
        size: 'slim',
        type: 'warning',
        subtitle: loc('oie.enroll.webauthn.uv.required.instructions', 'login'),
      }));
    }
    this.add('<div data-se="webauthn-waiting" class="okta-waiting-spinner"></div>');
  },
});
