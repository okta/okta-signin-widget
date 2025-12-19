import { View, loc, createButton } from '@okta/courage';
import hbs from '@okta/handlebars-inline-precompile';

export default View.extend({
  className: 'sign-in-with-passkeys-option',
  template: hbs`
    <div class="okta-passkeys-container">
    </div>
    <div class="separation-line">
      <span>{{i18n code="authbutton.divider.text" bundle="login"}}</span>
    </div>
  `,
  initialize() {
    this.add(createButton({
      className: 'button',
      icon: 'okta-passkeys-authenticator',
      title: loc('signinWithPasskeys.button', 'login'),
      click: () => {
        this.options.getCredentialsAndInvokeAction.call(this.options.formView);
      }
    }), '.okta-passkeys-container');
  },
});
