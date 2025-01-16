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
      const container = '.o-form-error-container';
      this.add(ScanNfcView, container);
      this.hideCodebox = true;
      const factorId = this.options.appState.attributes.currentAuthenticatorEnrollment.id;
      const url = 'http://localhost:8080/nfcChallenge';
      const data = { factorId };
      const response = await $.ajax({
        url,
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json',
      });
      if (response) {
        this.options.appState.trigger('hideScanNfc');
        this.noButtonBar = false;
        this.hideCodebox = false;
        this.render();
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
      this.noButtonBar = false;
      // codeBox.removeClass('hide');
      this.render();
    }
  },
));

export default BaseAuthenticatorView.extend({
  Body,
});
