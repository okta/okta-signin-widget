import { View, createButton } from 'okta';
import hbs from 'handlebars-inline-precompile';
import CookieUtil from 'util/CookieUtil';

export default View.extend({
  className: 'sign-in-with-device-option',
  template: hbs`
    <div class="okta-verify-container">
    </div>
    <div class="separation-line">
      <span>{{i18n code="authbutton.divider.text" bundle="login"}}</span>
    </div>
  `,
  initialize() {
    this.add(createButton({
      className: 'button',
      icon: 'okta-verify-authenticator',
      title: 'Use Touch ID',
      click() {
        this.model.set('webauthnEnrollmentHint', CookieUtil.getOnePassEnrollmentHint());
        this.options.appState.trigger('saveForm', this.model);
      }
    }), '.okta-verify-container');
  }
});