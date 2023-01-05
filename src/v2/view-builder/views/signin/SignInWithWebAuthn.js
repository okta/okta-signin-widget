import { View, loc, createButton } from '@okta/courage';
import hbs from '@okta/handlebars-inline-precompile';
import { FORMS } from '../../../ion/RemediationConstants';

export default View.extend({
  className: 'sign-in-with-webauthn-option',
  template: hbs`
    <div class="okta-webauthn-container">
    </div>
    <div class="separation-line">
      <span>{{i18n code="authbutton.divider.text" bundle="login"}}</span>
    </div>
  `,
  initialize() {
    this.add(createButton({
      className: 'button',
      icon: 'okta-webauthn-authenticator',
      title: loc('signinWithWebAuthn.button', 'login'),
      click: () => {
        this.options.appState.trigger('invokeAction', FORMS.LAUNCH_WEBAUTHN_AUTHENTICATOR);
      }
    }), '.okta-webauthn-container');
  },
});