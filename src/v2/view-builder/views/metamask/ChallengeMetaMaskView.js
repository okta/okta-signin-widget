import { loc } from "okta";
import BaseAuthenticatorView from "v2/view-builder/components/BaseAuthenticatorView";
import { BaseForm, BaseHeader } from "v2/view-builder/internals";
import { ethers } from 'ethers';
import { SiweMessage } from 'siwe';
import HeaderBeacon from "v2/view-builder/components/HeaderBeacon";

const domain = window.location.host;
const origin = window.location.origin;
const MESSAGE_STATEMENT = 'Sign in with Ethereum to the app.';

let currentAccount = null;
const handleAccountsChanged = (accounts) => {
  console.log(accounts);
  if (accounts.length && accounts.length > 0 && accounts[0] !== currentAccount) {
    currentAccount = accounts[0];
  }
};
// initial wallet check
if (typeof window.ethereum !== 'undefined' && ethereum.isMetaMask) {
  console.log('page load account check');
  ethereum
    .request({ method: 'eth_accounts' })
    .then(() => {
      console.log('page load handle');
      handleAccountsChanged();
    })
    .catch((err) => {
      console.log('page load account check');

      // Some unexpected error.
      // For backwards compatibility reasons, if no accounts are available,
      // eth_accounts will return an empty array.
      console.error(err);
    });
}

const Body = BaseForm.extend({

  title() {
    return loc('oie.verify.metamask.title', 'login');
  },

  async initialize() {
    this.provider = new ethers.providers.Web3Provider(window.ethereum);
    this.nonce = this.options.appState.get('currentAuthenticator').contextualData.challengeData.challenge;
    this.stateHandle = this.options.currentViewState.value.filter((val) => { return val.name === 'stateHandle' })[0].value;

    const credentials = await this.challengeMetaMask();
    this.model.set({
      credentials
    });
    // this.saveForm(this.model);
    this.options.appState.trigger('saveForm', this.model);
  },

  async challengeMetaMask() {
    const signer = await this.provider.getSigner();
    if (currentAccount === null) {
      currentAccount = await signer.getAddress();
    }
    const message = await this.createSiweMessage(currentAccount, MESSAGE_STATEMENT, this.nonce);
    const signature = await signer.signMessage(message);

    const credentials = {
      userHandle: currentAccount,
      signatureData: signature,
      authenticatorData: 'authenticatorData',
      clientData: 'clientData',
    };
    console.log(credentials);
    return credentials;
  },

  async getNonce(href, stateHandle) {
    const resp = await fetch(href, {
      method: "POST",
      body: {
        stateHandle
      }
    });
    const body = await resp.json();
    return body.nonce;
  },

  async createSiweMessage(address, statement, nonce) {
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
  },

  className: 'oie-verify-metamask',

  noButtonBar: true,
});

export default BaseAuthenticatorView.extend({
  Header: BaseHeader.extend({
    HeaderBeacon: HeaderBeacon.extend({
      authenticatorKey() {
        return this.options.appState.get('authenticatorKey');
      },
      getBeaconClassName: function () {
        return 'mfa-metamask';
      },
    }),
  }),
  Body,
  postRender() {
    BaseAuthenticatorView.prototype.postRender.apply(this, arguments);
  },
});