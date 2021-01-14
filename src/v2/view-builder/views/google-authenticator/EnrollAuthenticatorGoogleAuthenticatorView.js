import { loc, createButton } from 'okta';
import BaseForm from '../../internals/BaseForm';
import BaseView from '../../internals/BaseView';
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

  noButtonBar: true,

  className: 'oie-enroll-google-authenticator',

  getUISchema () {
    const schema = BaseForm.prototype.getUISchema.apply(this, arguments);

    schema[0].showWhen = {
      viewToDisplay: 'enterCode',
    };
    const nextButton = createButton({
      className: 'google-authenticator-next button-primary default-custom-button',
      title: loc('oform.next', 'login'),
      click: () => {
        this.model.set('viewToDisplay', 'enterCode');
      }
    });

    const verifyButton = createButton({
      className: 'google-authenticator-verify button-primary default-custom-button',
      title: loc('mfa.challenge.verify', 'login'),
      click: () => {
        this.options.appState.trigger('saveForm', this.model);
      }
    });

    schema.push({
      View: EnrollGoogleAuthenticatorBarcodeView,
      selector: '.o-form-fieldset-container',
      showWhen: {
        viewToDisplay: 'barcode',
      }
    }, {
      View: EnrollAuthenticatorManualSetupView,
      selector: '.o-form-fieldset-container',
      showWhen: {
        viewToDisplay: 'manual',
      }
    }, {
      label: false,
      className: 'shared-secret',
      type: 'text',
      placeholder: this.options.appState.get('currentAuthenticator').contextualData.sharedSecret,
      disabled: true,
      showWhen: {
        viewToDisplay: 'manual',
      }
    }, {
      View: nextButton,
      showWhen: {
        viewToDisplay: 'barcode',
      }
    }, {
      View: verifyButton,
      showWhen: {
        viewToDisplay: 'enterCode',
      }
    });
    return schema;
  },

  // postRender () {
  //   //BaseForm.prototype.render.apply(this, arguments);
  //   this.model.set('viewToDisplay', 'enterCode');
  //   this.model.set('viewToDisplay', 'barcode');
  // }
});

export default BaseAuthenticatorView.extend({
  Body,
  createModelClass () {
    const ModelClass = BaseView.prototype.createModelClass.apply(this, arguments);
    const local = Object.assign(
      {
        viewToDisplay: {
          value: 'barcode',
          type: 'string',
          required: true,
          values: ['barcode', 'manual', 'enterCode'],
        }
      },
      ModelClass.prototype.local,
    );
    return ModelClass.extend({
      local,
    });
  },
  Footer: AuthenticatorEnrollFooter,
});
