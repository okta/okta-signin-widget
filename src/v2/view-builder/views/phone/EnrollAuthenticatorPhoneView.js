import { _, loc, Model } from 'okta';
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

  handleMethodTypeChange (e, selectedMethod) {
    // Update the button label and value..
    const btn = this.el.querySelector('.o-form-button-bar .button-primary');
    const phoneField = this.el.querySelector('.phone-authenticator-enroll__phone');
    const extensionField = this.el.querySelector('.phone-authenticator-enroll__phone-ext');
    const smsBtnText = loc('oie.phone.enroll.smsButton', 'login');
    const voiceBtnText = loc('oie.phone.enroll.voiceButton', 'login');

    if (selectedMethod === 'voice') {
      btn.innerText = voiceBtnText;
      btn.value = voiceBtnText;
      if (!phoneField.classList.contains('phone-authenticator-enroll__phone--small')) {
        phoneField.classList.add('phone-authenticator-enroll__phone--small');
      }
      extensionField.classList.remove('hide');
    }

    if (selectedMethod === 'sms') {
      btn.innerText = smsBtnText;
      btn.value = smsBtnText;
      phoneField.classList.remove('phone-authenticator-enroll__phone--small');
      if (!extensionField.classList.contains('hide')) {
        extensionField.classList.add('hide');
      }
    }
  },

  handleCountryChange (e, selectedCountry) {
    const countryCodeField = this.el.querySelector('.phone-authenticator-enroll__phone-code');
    countryCodeField.innerText = `+${CountryUtil.getCallingCodeForCountry(selectedCountry)}`;
  },

  save () {
    return loc('oie.phone.enroll.smsButton', 'login');
  },

  getUISchema () {
    const uiSchemas = BaseForm.prototype.getUISchema.apply(this, arguments);

    // TODO: Using underscore to support IE, replace with Array.prototype methods (find, findIndex) when IE
    // support is removed
    const phoneNumberUISchema = _.find(uiSchemas, ({ name }) => name === 'authenticator.phoneNumber');
    const phoneNumberUISchemaIndex = _.findIndex(uiSchemas, ({ name }) => name === 'authenticator.phoneNumber');

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
      // Need to manually hide and show
      // - toggleWhen puts display: block on the element when it unhides hence can't be used.
      //   Because in this case, the element needs to be rendered as an inline-block.
      // - showWhen has an animation on the element when unhiding
      //   The animation makes the element look weird because of the way it is positioned,
      //   hence can't be used
      className: 'phone-authenticator-enroll__phone-ext hide',
      'label-top': true,
      name: 'extension',
    };

    if (phoneNumberUISchemaIndex !== -1) {
      // Replace phoneNumberUISchema..
      uiSchemas.splice(phoneNumberUISchemaIndex, 1, phoneNumberWithCodeUISchema);
      // Add countryUISchema before & extensionUISchema after phone..
      uiSchemas.splice(phoneNumberUISchemaIndex, 0, countryUISchema);
      uiSchemas.splice(phoneNumberUISchemaIndex + 2, 0, extensionUISchema);
    }

    return uiSchemas;
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
    const local = Object.assign(
      {
        country: {
          // Set default country to "US"
          'value': 'US',
          'type': 'string',
        },
        extension: {
          'type': 'string',
        },
      },
      ModelClass.prototype.local,
    );

    const derived = Object.assign(
      {
        phoneWithCode: {
          deps: ['extension', 'country', 'authenticator.methodType', 'authenticator.phoneNumber'],
          fn: function (extension, country, methodType, phoneNumber) {
            // Add country code..
            let formattedPhoneNumber =
              `+${CountryUtil.getCallingCodeForCountry(country)}${phoneNumber}`;  
    
            // Add extension if present..
            if (methodType === 'voice'
              && extension && extension.trim().length) {
              formattedPhoneNumber = `${formattedPhoneNumber}x${extension}`;
            }
            return formattedPhoneNumber;
          }
        }
      },
      ModelClass.prototype.derived
    )

    // Default value for authenticator.methodType
    Object.assign(
      ModelClass.prototype.props['authenticator.methodType'], {
        'value': 'sms'
      },
    );  

    return ModelClass.extend({
      local,
      derived,
      toJSON: function () {
        const modelJSON = Model.prototype.toJSON.call(this, arguments);
        // Override phone with formatted number..
        modelJSON.authenticator.phoneNumber = this.get('phoneWithCode');
        return modelJSON;
      },
    });
  },
});
