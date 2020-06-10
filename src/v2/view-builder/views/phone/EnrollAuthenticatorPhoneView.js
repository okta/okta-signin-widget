import { loc, Model } from 'okta';
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

  handleMethodTypeChange ({ changed }) {
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
      extensionField.classList.remove('hide');
    }

    if (smsSelected) {
      btn.innerText = smsBtnText;
      btn.value = smsBtnText;
      phoneField.classList.remove('phone-authenticator-enroll__phone--small');
      if (!extensionField.classList.contains('hide')) {
        extensionField.classList.add('hide');
      }
    }
  },

  handleCountryChange ({ changed }) {
    const countryCodeField = this.el.querySelector('.phone-authenticator-enroll__phone-code');
    countryCodeField.innerText = `+${CountryUtil.getCallingCodeForCountry(changed.country)}`;
  },

  save () {
    return loc('oie.phone.enroll.smsButton', 'login');
  },

  getUISchema () {
    const uiSchemas = BaseForm.prototype.getUISchema.apply(this, arguments);

    const authenticatorIdUISchema = uiSchemas.find(({name}) => name === 'authenticator.id');
    const methodTypeUISchema = uiSchemas.find(({name}) => name === 'authenticator.methodType');
    const phoneNumberUISchema = uiSchemas.find(({ name }) => name === 'authenticator.phoneNumber');
    const countryUISchema = {
      'label-top': true,
      label: loc('oie.phone.enroll.countryLabel', 'login'),
      type: 'select',
      options: CountryUtil.getCountries(),
      name: 'country',
    };

    // Create an input group - serves as a display wrapper
    const phoneNumberWithCodeUISchema = {
      label: loc('oie.phone.enroll.phoneLabel', 'login'),
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
        Object.assign({}, phoneNumberUISchema),
      ],
    };

    const extensionUISchema = {
      label: loc('oie.phone.enroll.phoneExtensionLabel', 'login'),
      type: 'text',
      className: 'phone-authenticator-enroll__phone-ext hide',
      'label-top': true,
      name: 'extension',
    };

    return [
      authenticatorIdUISchema,
      methodTypeUISchema,
      countryUISchema,
      phoneNumberWithCodeUISchema,
      extensionUISchema
    ];
  },

  initialize () {
    BaseForm.prototype.initialize.apply(this, arguments);
    this.listenTo(this.model, 'change:authenticator.methodType', this.handleMethodTypeChange.bind(this));
    this.listenTo(this.model, 'change:country', this.handleCountryChange.bind(this));
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

    return ModelClass.extend({
      toJSON: function () {
        const country = this.get('country');
        this.unset('country', { silent: true });

        // Add country code..
        let formattedPhoneNumber = `+${CountryUtil.getCallingCodeForCountry(country)}${this.get('authenticator.phoneNumber')}`;
        const extension = this.get('extension');
        this.unset('extension', { silent: true });

        // Add extension if present..
        if (this.get('authenticator.methodType') === 'voice'
          && extension && extension.trim().length) {
          formattedPhoneNumber = `${formattedPhoneNumber}x${extension}`;
        }

        this.set('authenticator.phoneNumber',
          formattedPhoneNumber, {
            silent: true
          }
        );

        return Model.prototype.toJSON.call(this, arguments);
      },
    });
  },
});
