import { View, createButton, loc } from '@okta/courage';
import hbs from '@okta/handlebars-inline-precompile';
import { FORMS } from '../../../ion/RemediationConstants';

export default View.extend({
  className: 'sign-in-with-nfc-option',
  template: hbs`
    <div class="okta-nfc-container"></div>
    {{#unless isRequired}}
    <div class="separation-line">
      <span>{{i18n code="authbutton.divider.text" bundle="login"}}</span>
    </div>
    {{/unless}}
  `,

  initialize() {
    const appState = this.options.appState;

    this.add(createButton({
      className: 'button',
      icon: 'okta-nfc-authenticator',
      title: loc('oie.nfc_pin.launch.button', 'login'),
      click() {
        if (this.model.get('identifier')) {
          this.options.settings.set('identifier', encodeURIComponent(this.model.get('identifier')));
        }
        appState.trigger('invokeAction', FORMS.LAUNCH_NFC_AUTHENTICATOR, {
          'rememberMe': this.model.get('rememberMe'),
        });
      }
    }), '.okta-nfc-container');
  },

  getTemplateData() {
    return {
      isRequired: !!this.options.isRequired,
    };
  },
});
