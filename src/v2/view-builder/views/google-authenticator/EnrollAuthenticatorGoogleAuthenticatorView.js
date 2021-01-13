import { loc, createButton } from 'okta';
import BaseForm from '../../internals/BaseForm';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';
import AuthenticatorEnrollFooter from '../../components/AuthenticatorEnrollFooter';
import EnrollGoogleAuthenticatorBarcodeView from './EnrollGoogleAuthenticatorBarcodeView';
import EnrollAuthenticatorManualSetupView from './EnrollAuthenticatorManualSetupView';

const Body = BaseForm.extend({
  title () {
    return loc('oie.enroll.google_authenticator.setup.title', 'login');
  },

  subtitle () {
    return loc('oie.enroll.google_authenticator.enterCode.title', 'login');
  },

  save () {
    return loc('mfa.challenge.verify', 'login');
  },

  className: 'oie-enroll-google-authenticator',

  modelEvents: {
    'triggerBarcodeView': '_triggerBarcodeView'
  },

  _triggerBarcodeView () {
    this.$('.oie-enroll-google-authenticator-barcode').hide();
    this._showmanualSetupView();
  },

  _showVerifyCodePage () {
    this.$('.oie-enroll-google-authenticator-barcode').hide();
    this.$('.google-authenticator-next').hide();
    this._hidemanualSetupView();
    this.$('.o-form-label-top').show();
    this.$('.o-form-button-bar [type="submit"]').show();
  },

  _hideVerifyCodePage () {
    this.$('.o-form-label-top').hide();
    this.$('.o-form-button-bar [type="submit"]').hide();
    this.$('.okta-form-subtitle').hide();
  },

  _showmanualSetupView () {
    this.$('.shared-secret').show();
    this.$('.oie-enroll-google-authenticator-manual-setup').show();
  },

  _hidemanualSetupView () {
    this.$('.shared-secret').hide();
    this.$('.oie-enroll-google-authenticator-manual-setup').hide();
  },

  render () {
    BaseForm.prototype.render.apply(this, arguments);
    this.$('.oie-enroll-google-authenticator-manual-setup').hide();
    this.$('.shared-secret').hide();
    this._hideVerifyCodePage();
  },

  getUISchema () {
    const schema = BaseForm.prototype.getUISchema.apply(this, arguments);

    const nextButton = createButton({
      className: 'google-authenticator-next button-primary default-custom-button',
      title: loc('oform.next', 'login'),
      selector: '.o-form-button-bar',
      click: () => {
        this._showVerifyCodePage();
      }
    });

    schema.push({
      View: EnrollGoogleAuthenticatorBarcodeView,
      selector: '.o-form-fieldset-container',
    }, {
      View: EnrollAuthenticatorManualSetupView,
      selector: '.o-form-fieldset-container',
    }, {
      label: false,
      className: 'shared-secret',
      type: 'text',
      placeholder: this.options.appState.get('currentAuthenticator').contextualData.sharedSecret,
      disabled: true,
    }, {
      View: nextButton,
      selector: '.o-form-fieldset-container',
    });

    return schema;
  },
});

export default BaseAuthenticatorView.extend({
  Body,
  Footer: AuthenticatorEnrollFooter,
});
