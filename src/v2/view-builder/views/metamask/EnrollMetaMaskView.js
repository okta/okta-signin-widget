import BaseAuthenticatorView from "v2/view-builder/components/BaseAuthenticatorView";
import { _, loc, createCallout, createButton } from 'okta';
import { BaseForm } from '../../internals';
import webauthn from 'util/webauthn';
import CryptoUtil from 'util/CryptoUtil';
import EnrollMetamaskInfoView from './EnrollMetamaskInfoView';
import {getMessageFromBrowserError} from 'v2/ion/i18nTransformer';
import { ethers } from 'ethers';
import { SiweMessage } from 'siwe';

let currentAccount = null;
const handleAccountsChanged = (accounts) => {
  if (accounts.length && accounts.length > 0 && accounts[0] !== currentAccount) {
    currentAccount = accounts[0];
  }
};

function getExcludeCredentials(authenticatorEnrollments = []) {
  const credentials = [];
  authenticatorEnrollments.forEach((enrollement) => {
    if (enrollement.key === 'webauthn') {
      credentials.push({
        type: 'public-key',
        id: CryptoUtil.strToBin(enrollement.credentialId),
      });
    }
  });
  return credentials;
}

const Body = BaseForm.extend({

  title() {
    return loc('oie.enroll.webauthn.metamask.title', 'login');
  },
  className: 'oie-enroll-webauthn-metamask',
  modelEvents: {
    'error': '_stopEnrollment',
  },
  getUISchema() {
    const schema = [];
    // Returning custom array so no input fields are displayed for webauthn
    schema.push({
      View: EnrollMetamaskInfoView,
    });

    schema.push({
      View: createButton({
        className: 'webauthn-setup button button-primary button-wide',
        title: loc('oie.enroll.webauthn.save', 'login'),
        click: () => {
          this.triggerToWalletPrompt();
        },
      }),
    });

    return schema;
  },


  triggerToWalletPrompt() {
    ethereum
      .request({method: 'eth_requestAccounts'})
      .then(async (data) => {
        handleAccountsChanged(data);

        // const credentials = await this.challengeMetaMask();
        console.log(currentAccount);
        this.model.set({
          credentials: {
            credentialId: currentAccount,
          }
        });
        this.saveForm(this.model);
      })
      .catch((err) => {
        if (err.code === 4001) {
          // EIP-1193 userRejectedRequest error
          // If this happens, the user rejected the connection request.
          console.log('Please connect to MetaMask.');
        } else {
          console.error(err);
        }
      });
  },

  _startEnrollment: function() {
    this.$('.okta-waiting-spinner').show();
    this.$('.webauthn-setup').hide();
  },

  _stopEnrollment: function() {
    this.$('.okta-waiting-spinner').hide();
    this.$('.webauthn-setup').show();
  },
});

export default BaseAuthenticatorView.extend({
  Body,
  postRender() {
    BaseAuthenticatorView.prototype.postRender.apply(this, arguments);
    this.$el.find('.o-form-button-bar [type="submit"]').remove();
  },
});
