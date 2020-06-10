import { loc } from 'okta';
import BaseView from '../../internals/BaseView';
import BaseForm from '../../internals/BaseForm';
import BaseFactorView from '../shared/BaseFactorView';
import CountryUtil from '../../../../util/CountryUtil';

const Body = BaseForm.extend({

  className: 'phone-authenticator-enroll',

  title () {
    return loc('oie.phone.enroll.title', 'login');
  },

  subtitle () {
    return loc('oie.phone.enroll.subtitle', 'login');
  },

  _changeView ({ changed }) {
    // Update the button label and value..
    const btn = this.el.querySelector('.o-form-button-bar .button-primary');
    const phoneField = this.el.querySelector('.phone-authenticator-enroll__phone');
    const extensionField = this.el.querySelector('.phone-authenticator-enroll__phone-ext');

    const voiceSelected = changed['authenticator.methodType'] === 'voice';
    const smsSelected = changed['authenticator.methodType'] === 'sms';
    const smsBtnText = loc('oie.phone.enroll.smsButton', 'login');
    const voiceBtnText = loc('oie.phone.enroll.voiceButton', 'login');

    if (voiceSelected) {
      btn.innerText = voiceBtnText;
      btn.value = voiceBtnText;
      if (!phoneField.classList.contains('phone-authenticator-enroll__phone--small')) {
        phoneField.classList.add('phone-authenticator-enroll__phone--small');
      }
      extensionField.classList.remove('hidden');
    }

    if (smsSelected) {
      btn.innerText = smsBtnText;
      btn.value = smsBtnText;
      phoneField.classList.remove('phone-authenticator-enroll__phone--small');
      if (!extensionField.classList.contains('hidden')) {
        extensionField.classList.add('hidden');
      }
    }
  },

  _changeCountry ({ changed }) {
    const countryCodeField = this.el.querySelector('.phone-authenticator-enroll__phone-code');
    countryCodeField.innerText = `+${CountryUtil.getCallingCodeForCountry(changed.country)}`;
  },

  save () {
    return loc('oie.phone.enroll.smsButton', 'login');
  },

  initialize () {
    const argArr = Array.prototype.slice.call(arguments);
    const { currentViewState } = argArr[0];

    const countryUISchema = {
      'label-top': true,
      label: 'Country',
      type: 'select',
      options: CountryUtil.getCountries(),
      name: 'country',
    };

    // Create an input group- serves as a display
    const phoneNumberUISchema = {
      label: 'Phone number',
      type: 'group',
      modelType: 'string',
      'label-top': true,
      className : 'phone-authenticator-enroll__phone',
      input: [
        {
          type: 'label',
          label: '+1',
          className: 'phone-authenticator-enroll__phone-code',
        },
        Object.assign({}, currentViewState.uiSchema[2]),
      ]
    };

    const extensionUISchema = {
      label: 'Extension',
      type: 'text',
      className: 'phone-authenticator-enroll__phone-ext hidden',
      'label-top': true,
      name: 'extension',
    };

    // Add country select input
    currentViewState.uiSchema.splice(2, 0, countryUISchema);
    currentViewState.uiSchema.splice(3, 0, phoneNumberUISchema);
    currentViewState.uiSchema.splice(4, 1, extensionUISchema);

    BaseForm.prototype.initialize.apply(this, argArr);

    this.listenTo(this.model, 'change:authenticator.methodType', this._changeView.bind(this));
    this.listenTo(this.model, 'change:country', this._changeCountry.bind(this));
  },

  saveForm () {
    this.clearErrors();
    this.model.unset('country', { silent: true });
    const extension = this.model.get('extension');
    if (extension && extension.trim().length) {
      this.model.set('authenticator.phoneNumber',
        `${this.model.get('authenticator.phoneNumber')}x${extension}`, {
          silent: true
        }
      );
    }
    this.model.unset('extension', { silent: true });
    BaseForm.prototype.saveForm.call(this, this.model);
  },
});

export default BaseFactorView.extend({

  Body,

  createModelClass () {
    const ModelClass = BaseView.prototype.createModelClass.apply(this, arguments);

    // Default value for authenticator.methodType
    Object.assign(
      ModelClass.prototype.props['authenticator.methodType'], {
        'value': 'sms'
      },
    );
    
    // Set default country to "US"    
    Object.assign(
      ModelClass.prototype.props, {
        'country': {
          'value': 'US',
          'type': 'string',
        }
      }
    );

    return ModelClass;
  },
});
