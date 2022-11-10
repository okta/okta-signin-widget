import { loc, View, createCallout } from '@okta/courage';
import BrowserFeatures from 'util/BrowserFeatures';
import hbs from '@okta/handlebars-inline-precompile';

export default View.extend({
  // eslint-disable-next-line max-len
  template: hbs`<p class="idx-webauthn-enroll-text">{{i18n code="oie.enroll.webauthn.instructions" bundle="login"}}</p>`,
  initialize() {
    const relatesToObject = this.options.currentViewState.relatesTo;
    const activationData = relatesToObject?.value.contextualData.activationData;
    if (BrowserFeatures.isEdge()) {
      this.add(View.extend({
        tagName: 'p',
        className: 'idx-webauthn-enroll-text-edge',
        template: hbs`{{i18n code="oie.enroll.webauthn.instructions.edge" bundle="login"}}`
      }));
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
