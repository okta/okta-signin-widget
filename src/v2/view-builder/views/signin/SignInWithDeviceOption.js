import { View, createButton, loc } from 'okta';
import hbs from 'handlebars-inline-precompile';

export default View.extend({
  className: 'sign-in-with-device-option',
  template: hbs`
    <div class="okta-verify-container"></div>
    <div class="separation-line"><span>OR</span></div>
  `,
  initialize () {
    const appState = this.options.appState;
    this.add(createButton({
      className: 'button',
      title: loc('oktaVerify.button', 'login'),
      click () {
        appState.trigger('invokeAction', 'launch-authenticator');
      }
    }), '.okta-verify-container');
  }
});