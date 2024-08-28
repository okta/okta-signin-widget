import { _, loc, Model } from '@okta/courage';
import { BaseForm, BaseView } from '../../internals';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';
import CountryUtil from '../../../../util/CountryUtil';

const Body = BaseForm.extend({

  className: 'phone-authenticator-enroll',

  title() {
    return loc('oie.phone.enroll.title', 'login');
  },

  subtitle() {
    return this.model.get('authenticator.methodType') === 'voice'
      ? loc('oie.phone.enroll.call.subtitle', 'login')
      : loc('oie.phone.enroll.sms.subtitle', 'login');
  },

  render() {
    BaseForm.prototype.render.apply(this, arguments);
    this.el.querySelector('.phone-authenticator-enroll__phone-code').innerText = `+${this.model.get('phoneCode')}`;
  },

  handlePhoneCodeChange() {
    const countryCodeField = this.el.querySelector('.phone-authenticator-enroll__phone-code');
    countryCodeField.innerText = `+${this.model.get('phoneCode')}`;
  },

  save() {
    return this.model.get('authenticator.methodType') === 'voice'
      ? loc('oie.phone.call.primaryButton', 'login')
      : loc('oie.phone.sms.primaryButton', 'login');
  },

  getUISchema() {
    const uiSchemas = BaseForm.prototype.getUISchema.apply(this, arguments);

    // TODO: Using underscore to support IE, replace with Array.prototype methods (find, findIndex) when IE
    // support is removed
    const phoneNumberUISchemaIndex = _.findIndex(uiSchemas, ({ name }) => name === 'authenticator.phoneNumber');

    const countryUISchema = {
      'label-top': true,
      label: loc('mfa.country', 'login'),
      type: 'select',
      options: CountryUtil.getCountries(),
      name: 'country',
      wide: true,
    };

    const inputId = 'okta-phone-number-input';
    
    // Create an input group - serves as a display wrapper
    const phoneNumberWithCodeUISchema = {
      label: loc('mfa.phoneNumber.placeholder', 'login'),
      inputId,
      type: 'group',
      modelType: 'string',
      'label-top': true,
      name: 'phoneCode',
      className : 'phone-authenticator-enroll__phone',
      input: [
        {
          type: 'label',
          /* eslint-disable-next-line @okta/okta/no-unlocalized-text */
          label: `+${this.model.get('phoneCode')}`,
          className: 'phone-authenticator-enroll__phone-code no-translate',
        },
        Object.assign({ inputId }, uiSchemas[phoneNumberUISchemaIndex]),
      ],
    };

    const extensionUISchema = {
      label: loc('phone.extention.label', 'login'),
      type: 'text',
      className: 'phone-authenticator-enroll__phone-ext',
      'label-top': true,
      name: 'extension',
      showWhen: {
        'authenticator.methodType': 'voice'
      }
    };

    if (phoneNumberUISchemaIndex !== -1) {
      // Replace phoneNumberUISchema..
      uiSchemas.splice(phoneNumberUISchemaIndex, 1, phoneNumberWithCodeUISchema);
      // Add countryUISchema before & extensionUISchema after phone..
      uiSchemas.splice(phoneNumberUISchemaIndex, 0, countryUISchema);
      uiSchemas.splice(phoneNumberUISchemaIndex + 2, 0, extensionUISchema);
    }

    const methodType = _.find(uiSchemas,  ({ name }) => name === 'authenticator.methodType');

    if (methodType && methodType.options.length === 1) {
      methodType.className = 'hide';
    }

    return uiSchemas;
  },

  updateConditionalText() {
    this.el.querySelector('.okta-form-subtitle').innerText = this.subtitle();
    this.el.querySelector('input[type="submit"]').value = this.save();
  },

  initialize() {
    BaseForm.prototype.initialize.apply(this, arguments);
    this.listenTo(this.model, 'change:authenticator.methodType', this.updateConditionalText);
    this.listenTo(this.model, 'change:phoneCode', this.handlePhoneCodeChange.bind(this));
  },
});

export default BaseAuthenticatorView.extend({

  Body,

  createModelClass() {
    const ModelClass = BaseView.prototype.createModelClass.apply(this, arguments);
    const local = Object.assign(
      {
        country: {
          'value': this.settings.get('defaultCountryCode'),
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
        phoneCode: {
          deps: [ 'country' ],
          fn: function(country) {
            return CountryUtil.getCallingCodeForCountry(country);
          },
        },
      },
      ModelClass.prototype.derived,
    );
    return ModelClass.extend({
      local,
      derived,
      toJSON: function() {
        const modelJSON = Model.prototype.toJSON.call(this, arguments);
        const extension = this.get('extension');
        const phoneCode = this.get('phoneCode');

        // Add country code..
        let formattedPhoneNumber = `+${phoneCode}${modelJSON.authenticator.phoneNumber}`;

        // Add extension if present..
        if (modelJSON.authenticator.methodType === 'voice' && extension?.trim().length) {
          formattedPhoneNumber = `${formattedPhoneNumber}x${extension}`;
        }
        // Override phone with formatted number..
        modelJSON.authenticator.phoneNumber = formattedPhoneNumber;
        return modelJSON;
      },
    });
  },
});
