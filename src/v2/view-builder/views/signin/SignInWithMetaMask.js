import { View, loc, createButton } from 'okta';
import hbs from 'handlebars-inline-precompile';
import { FORMS } from '../../../ion/RemediationConstants';
import ChallengeMetaMaskView from '../metamask/ChallengeMetaMaskView';

let currentAccount = null;
const handleAccountsChanged = (accounts) => {
  if (accounts.length && accounts.length > 0 && accounts[0] !== currentAccount) {
    currentAccount = accounts[0];
  }
};
// initial wallet check
if (typeof window.ethereum !== 'undefined' && ethereum.isMetaMask) {
  ethereum
    .request({ method: 'eth_accounts' })
    .then(handleAccountsChanged)
    .catch((err) => {
      // Some unexpected error.
      // For backwards compatibility reasons, if no accounts are available,
      // eth_accounts will return an empty array.
      console.error(err);
    });
}

export default View.extend({
  className: 'sign-in-with-metamask-option',
  Body: ChallengeMetaMaskView,
  template: hbs`
    <div class="okta-metamask-container">
    </div>
    <div class="separation-line">
      <span>{{i18n code="authbutton.divider.text" bundle="login"}}</span>
    </div>
  `,
  initialize() {
    this.add(createButton({
      className: 'button',
      icon: 'okta-metamask-authenticator',
      title: loc('signinWithMetaMask.button', 'login'),
      click: async () => {
        this.options.appState.trigger('invokeAction', FORMS.LAUNCH_METAMASK_AUTHENTICATOR);
      }
    }), '.okta-metamask-container');
  },
});