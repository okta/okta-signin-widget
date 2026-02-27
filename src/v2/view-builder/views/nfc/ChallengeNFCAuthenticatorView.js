/* eslint-disable max-statements */
import { loc, $ } from '@okta/courage';
import { BaseFormWithPolling } from '../../internals';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';
import ScanNfcView from './ScanNFCView';

const Body = BaseFormWithPolling.extend(Object.assign(
  {
    noButtonBar: true,
    className: 'mfa-verify-nfc',

    title() {
      const vendorName =
        loc('oie.nfc.authenticator.default.vendorName', 'login');
      return loc('oie.verify.nfc.title', 'login', [vendorName]);
    },

    save() {
      return loc('mfa.challenge.verify', 'login');
    },

    async initialize() {
      BaseFormWithPolling.prototype.initialize.apply(this, arguments);
      // this.startPolling();
      const container = '.o-form-error-container';
      this.add(ScanNfcView, container);
      this.hideCodebox = true;
      console.log('hi')
      console.log(this.options.appState);
      // need to see if we can have userID
      this.factorId = this.options.appState?.attributes?.currentAuthenticatorEnrollment?.id || undefined;
      if (!this.factorId) {
        //enroll flow
        const url = 'http://localhost:3001/createNfcAndPin';
        const externalId = this.options.appState.attributes.currentAuthenticator.contextualData['data_to_write'];
        const transactionHandle = this.options.appState.attributes.currentAuthenticator.contextualData.transactionHandle;
        const data = { externalId, transactionHandle }; //i know its not factorId, but doing this for simplicity
        const response = await $.ajax({
          url,
          type: 'POST',
          data: JSON.stringify(data),
          contentType: 'application/json',
        });
        console.log('hello!!2')
        console.log(externalId, response);
        window.debugResponse = response
        if (response) {
          // this.stopPolling()
          this.options.appState.trigger('hideScanNfc');
          this.noButtonBar = false;
          this.hideCodebox = false;
          this.factorId = response.factorId;
          this.model.set('credentials.factorId', this.factorId) //should be enrollmentId
          this.render();
        }

      } else {
        // verify flow, where do we get the data from?
        const url = 'http://localhost:3001/nfcChallenge';
        const data = { factorId: this.factorId }; //jake i don't think we need this
        const response = await $.ajax({
          url,
          type: 'POST',
          data: JSON.stringify(data),
          contentType: 'application/json',
        });
        console.log('hello!!')
        console.log(this.factorId, response);
        if (response && response.data) {
          // this.stopPolling()
          this.options.appState.trigger('hideScanNfc');
          this.noButtonBar = false;
          this.hideCodebox = false;
          this.model.set('credentials.externalId', response.data);
          this.render();
        }
      }
    },

    postRender() {
      
      if (this.hideCodebox) {
        const codeBox = this.$el.find('.o-form-fieldset-container');
        codeBox.addClass('hide');
      }
    },

    callScanner() {
      const factorId = this.options.appState.attributes.currentAuthenticatorEnrollment.id;
      const url = 'http://localhost:8080/nfcChallenge';
      const data = { factorId };
      return $.ajax({
        url,
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json',
      });
    },

    handleResponse() {
      this.options.appState.trigger('hideScanNfc');
      // this.stopPolling()
      this.noButtonBar = false;
      this.
      // codeBox.removeClass('hide');
      this.render();
    }
  },
));

export default BaseAuthenticatorView.extend({
  Body,
});