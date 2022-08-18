import { _, View, createButton } from 'okta';
import hbs from 'handlebars-inline-precompile';
import { FORMS } from '../../../ion/RemediationConstants';
import transformIdxResponse from '../../../ion/transformIdxResponse';
import { getMessageFromBrowserError } from '../../../ion/i18nTransformer';
import sessionStorageHelper from '../../../client/sessionStorageHelper';
import CryptoUtil from 'util/CryptoUtil';

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
      click: async () => {
        this.handleWebAuthnWithInterstitial();
      }
    }), '.okta-verify-container');
  },
  handleWebAuthnWithInterstitial: function(){
    this.options.appState.trigger('invokeAction', FORMS.LAUNCH_WEBAUTHN_AUTHENTICATOR);
  },
  displayError: function(error){
    console.log(error);
    this.model.trigger('error', this.model, {responseJSON: {errorSummary: getMessageFromBrowserError(error)}});
  }
});