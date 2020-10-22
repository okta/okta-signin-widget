import { View, createButton, loc } from 'okta';
import hbs from 'handlebars-inline-precompile';

export default View.extend({
  className: 'sign-in-with-device-option',
  template: hbs`
    <div class="okta-verify-container">
    {{#if signInWithDeviceIsRequired}}
      <div class="signin-with-ov-description">
        {{i18n code="oktaVerify.description" bundle="login"}}
      </div>
    {{/if}}
    </div>
    {{#unless signInWithDeviceIsRequired}}
    <div class="separation-line">
      <span>{{i18n code="authbutton.divider.text" bundle="login"}}</span>
    </div>
    {{/unless}}
  `,
  initialize () {
    const appState = this.options.appState;
    this.add(createButton({
      className: 'button',
      title: loc('oktaVerify.button', 'login'),
      click () {
        if (this.options.isRequired) {
          appState.trigger('saveForm', this.model);
        } else {
          appState.trigger('invokeAction', 'launch-authenticator');
        }
      }
    }), '.okta-verify-container');
  },

  getTemplateData () {
    return {
      signInWithDeviceIsRequired: !!this.options.isRequired,
    };
  }
});