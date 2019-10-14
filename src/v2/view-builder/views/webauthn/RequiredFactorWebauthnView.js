import { loc } from 'okta';
import Q from 'q';
import BaseForm from '../../internals/BaseForm';
import BaseFooter from '../../internals/BaseFooter';
import BaseFactorView from '../shared/BaseFactorView';
import CryptoUtil from '../../../../util/CryptoUtil';

const Body = BaseForm.extend({

  title: loc('factor.webauthn', 'login'),

  save: loc('mfa.challenge.verify', 'login'),

  saveForm () {
    const factor = this.options.appState.get('factor');
    const allowCredentials = [];
    allowCredentials.push({
      type: 'public-key',
      id: CryptoUtil.strToBin(factor.profile.credentialId)
    });
    const options = {
      allowCredentials,
      challenge: CryptoUtil.strToBin('nXgwucBkbC6eiSEEn96Q')
    };
    Q(navigator.credentials.get({publicKey: options}))
      .then((assertion) => {
        this.model.set({
          clientData: CryptoUtil.binToStr(assertion.response.clientDataJSON),
          authenticatorData: CryptoUtil.binToStr(assertion.response.authenticatorData),
          signatureData: CryptoUtil.binToStr(assertion.response.signature),
        });
        BaseForm.prototype.saveForm.apply(this, arguments);
      })
      .fail(function (error) {
        // self.trigger('errors:clear');
        // throw new Errors.WebAuthnError({
        //   xhr: {responseJSON: {errorSummary: error.message}}
        // });
      });
  },
});

const Footer = BaseFooter.extend({
  links: function () {
    // recovery link
    var links = [];

    // check if we have a select-factor form in remediation, if so add a link
    if (this.options.appState.hasRemediationForm('select-factor')) {
      links.push({
        'type': 'link',
        'label': 'Switch Factor',
        'name': 'switchFactor',
        'formName': 'select-factor',
      });
    }
    return links;
  }
});

export default BaseFactorView.extend({
  Body,
  Footer,
});
