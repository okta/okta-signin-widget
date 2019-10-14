import { loc, _ } from 'okta';
import BaseForm from '../../internals/BaseForm';
import BaseFactorView from '../shared/BaseFactorView';
import Q from 'q';
import CryptoUtil from '../../../../util/CryptoUtil';

const Body = BaseForm.extend({
  title: loc('enroll.webauthn.title', 'login'),
  save: loc('enroll.webauthn.save', 'login'),
  getExcludeCredentials (credentials) {
    const excludeCredentials = [];
    _.each(credentials, function (credential) {
      excludeCredentials.push({
        type: 'public-key',
        id: CryptoUtil.strToBin(credential.id)
      });
    });
    return excludeCredentials;
  },
  saveForm () {
    const activation = this.options.appState.get('activation');
    const options = _.extend({}, activation, {
      challenge: CryptoUtil.strToBin(activation.challenge),
      user: {
        id: CryptoUtil.strToBin(activation.user.id),
        name: activation.user.name,
        displayName: activation.user.displayName
      },
      excludeCredentials: this.getExcludeCredentials(activation.excludeCredentials)
    });

    Q(navigator.credentials.create({publicKey: options}))
      .then((newCredential) => {
        this.model.set({
          attestation: CryptoUtil.binToStr(newCredential.response.attestationObject),
          clientData: CryptoUtil.binToStr(newCredential.response.clientDataJSON)
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

export default BaseFactorView.extend({

  Body,
});
