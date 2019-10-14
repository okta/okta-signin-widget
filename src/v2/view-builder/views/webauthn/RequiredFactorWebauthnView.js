import { loc, _ } from 'okta';
import Q from 'q';
import BaseForm from '../../internals/BaseForm';
import BaseFooter from '../../internals/BaseFooter';
import BaseFactorView from '../shared/BaseFactorView';
import CryptoUtil from '../../../../util/CryptoUtil';
import webauthn from '../../../../util/webauthn';
import FormType from '../../../../util/FormType';

const Body = BaseForm.extend({

  title: loc('factor.webauthn.biometric', 'login'),

  save: loc('retry', 'login'),

  getUISchema () {
    return [];
  },

  initialize () {
    BaseForm.prototype.initialize.apply(this, arguments);
    this.addInputOrView({
      View:
           '<div class="webauthn-verify-text">\
             <p>{{i18n code="verify.webauthn.biometric.instructions" bundle="login"}}</p>\
             <div data-se="webauthn-waiting" class="okta-waiting-spinner"></div>\
           </div>'
    }); 
  },

  noButtonBar: function () {
    return true;
  },

  modelEvents: {
    'request': '_startEnrollment',
    'error': '_stopEnrollment'
  },

  verify () {
    const factor = this.options.appState.get('factor');
    const allowCredentials = [];
    allowCredentials.push({
      type: 'public-key',
      id: CryptoUtil.strToBin(factor.contextualData.profile.credentialId)
    });
    const options = {
      allowCredentials,
      challenge: CryptoUtil.strToBin(factor.contextualData.challengeData.challenge)
    };
    Q(navigator.credentials.get({publicKey: options}))
      .then((assertion) => {
        this.model.set({
          credentials : {
            clientData: CryptoUtil.binToStr(assertion.response.clientDataJSON),
            authenticatorData: CryptoUtil.binToStr(assertion.response.authenticatorData),
            signatureData: CryptoUtil.binToStr(assertion.response.signature),
          }
        });
        this.saveForm(this.model);
        //BaseForm.prototype.saveForm.apply(this, arguments);
      })
      .fail(function (error) {
        // self.trigger('errors:clear');
        // throw new Errors.WebAuthnError({
        //   xhr: {responseJSON: {errorSummary: error.message}}
        // });
      });
  },
  postRender: function () {
    _.defer(_.bind(function () {
      if (webauthn.isNewApiAvailable()) {
        this.verify();
      }
      else {
        this.$('[data-se="webauthn-waiting"]').hide();
      }
    }, this));
  },

  _startEnrollment: function () {
    this.$('.okta-waiting-spinner').show();
    this.$('.o-form-button-bar').hide();
  },

  _stopEnrollment: function () {
    this.$('.okta-waiting-spinner').hide();
    this.$('.o-form-button-bar').show();
  }
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
