import { View, loc, createButton } from 'okta';
import hbs from 'handlebars-inline-precompile';
import { ethers } from 'ethers';
import { SiweMessage } from 'siwe';
import { FORMS } from '../../../ion/RemediationConstants';
import BaseAuthenticatorView from '../metamask/EnrollMetaMaskView';
import { BaseForm } from 'v2/view-builder/internals';
import ChallengeMetaMaskView from '../metamask/ChallengeMetaMaskView';

const domain = window.location.host;
const origin = window.location.origin;

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

const getNonce = async (href, stateHandle) => {
  const resp = await fetch(href, {
    method: "POST",
    body: {
      stateHandle
    }
  });
  const body = await resp.json();
  return body.nonce;
};

const challengeMetaMask = async (provider, nonceHref, stateHandle) => {
  const signer = await provider.getSigner();
  // get nonce
  const nonce = await getNonce(nonceHref, stateHandle);

  const message = await createSiweMessage(
    currentAccount,
    'Sign in with Ethereum to the app.',
    nonce
  );
  const signature = await signer.signMessage(message);
  console.log(signature);
  console.log(currentAccount);

  const credentials = {
    signature,
    currentAccount
  };

  return credentials;
};

const createSiweMessage = async (address, statement, nonce) => {
  const message = new SiweMessage({
    domain,
    address,
    statement,
    uri: origin,
    version: '1',
    chainId: '1',
    nonce: nonce
  });
  return message.prepareMessage();
};

export default View.extend({
  className: 'sign-in-with-webauthn-option',
  Body: ChallengeMetaMaskView,
  template: hbs`
    <div class="okta-webauthn-container">
    </div>
    <div class="separation-line">
      <span>{{i18n code="authbutton.divider.text" bundle="login"}}</span>
    </div>
  `,
  initialize() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    this.add(createButton({
      className: 'button',
      icon: 'okta-metamask-authenticator',
      title: loc('signinWithMetaMask.button', 'login'),
      click: async () => {
        this.options.appState.trigger('invokeAction', FORMS.LAUNCH_METAMASK_AUTHENTICATOR);
        // const currentViewState = this.options.appState.get('remediations').filter(r => r.name === FORMS.LAUNCH_METAMASK_AUTHENTICATOR)[0];
        // const stateHandle = this.options.currentViewState.value.filter((val) => { return val.name === 'stateHandle' })[0].value;

        // await connectWallet(provider);
        // const credentials = await challengeMetaMask(provider, currentViewState.href, stateHandle);

        // this.model.set({
        //   credentials
        // });
        // ChallengeMetaMaskView.saveForm(this.model);
      }
    }), '.okta-webauthn-container');
  },
});