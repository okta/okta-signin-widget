import { View, loc, createButton } from '@okta/courage';
import hbs from '@okta/handlebars-inline-precompile';
import Util from '../../../../util/Util';
import { FORMS } from '../../../ion/RemediationConstants';

export default View.extend({
  className: 'sign-in-with-nfc-option',
  template: hbs`
    <div class="okta-nfc-container">
    </div>
    <div class="separation-line">
      <span>{{i18n code="authbutton.divider.text" bundle="login"}}</span>
    </div>
  `,
  initialize() {
    const appState = this.options.appState;
    // const nfcRemediation = appState.hasRemediationObject(FORMS.LAUNCH_NFC_AUTHENTICATOR);
    this.add(createButton({
      className: 'button',
      icon: 'okta-nfc-authenticator',
      title: loc('signinWithNfc.button', 'login'),
      click: () => {
        appState.trigger('invokeAction', FORMS.LAUNCH_NFC_AUTHENTICATOR, {'rememberMe': this.model.get('rememberMe')});
      }
    }), '.okta-nfc-container');
  },
});
