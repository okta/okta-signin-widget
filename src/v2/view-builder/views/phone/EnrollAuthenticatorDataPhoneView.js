import { _, loc, Model } from 'okta';
import { BaseForm, BaseView } from '../../internals';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';
import CountryUtil from '../../../../util/CountryUtil';
import AuthenticatorEnrollFooter from '../../components/AuthenticatorEnrollFooter';

const Body = BaseForm.extend({

  className: 'phone-authenticator-enroll',

  title () {
    return loc('oie.phone.enroll.title', 'login');
  },

  subtitle () {
    return loc('oie.phone.enroll.subtitle', 'login');
  },

  render () {
    BaseForm.prototype.render.apply(this, arguments);
    const selectedMethod = this.model.get('authenticator.methodType');
    const phoneField = this.el.querySelector('.phone-authenticator-enroll__phone');
    const extensionField = this.el.querySelector('.phone-authenticator-enroll__phone-ext');

    if (selectedMethod === 'voice') {
      if (!phoneField.classList.contains('phone-authenticator-enroll__phone--small')) {
        phoneField.classList.add('phone-authenticator-enroll__phone--small');
      }
      extensionField.classList.remove('hide');
    }

    if (selectedMethod === 'sms') {
      phoneField.classList.remove('phone-authenticator-enroll__phone--small');
      if (!extensionField.classList.contains('hide')) {
        extensionField.classList.add('hide');
      }
    }

    this.el.querySelector('.phone-authenticator-enroll__phone-code').innerText = `+${this.model.get('phoneCode')}`;
  },

  handlePhoneCodeChange () {
    const countryCodeField = this.el.querySelector('.phone-authenticator-enroll__phone-code');
    countryCodeField.innerText = `+${this.model.get('phoneCode')}`;
  },

  save () {
    return this.model.get('authenticator.methodType') === 'voice'
      ? loc('oie.phone.call.primaryButton', 'login')
      : loc('oie.phone.sms.primaryButton', 'login');
  },

  getUISchema () {
    const uiSchemas = BaseForm.prototype.getUISchema.apply(this, arguments);

    // TODO: Using underscore to support IE, replace with Array.prototype methods (find, findIndex) when IE
    // support is removed
    const phoneNumberUISchema = _.find(uiSchemas, ({ name }) => name === 'authenticator.phoneNumber');
    const phoneNumberUISchemaIndex = _.findIndex(uiSchemas, ({ name }) => name === 'authenticator.phoneNumber');

    const countryUISchema = {
      'label-top': true,
      label: loc('country.label', 'login'),
      type: 'select',
      options: CountryUtil.getCountries(),
      name: 'country',
      wide: true,
    };

    // Create an input group - serves as a display wrapper
    const phoneNumberWithCodeUISchema = {
      label: loc('mfa.phoneNumber.placeholder', 'login'),
      type: 'group',
      modelType: 'string',
      'label-top': true,
      name: 'phoneCode',
      className : 'phone-authenticator-enroll__phone',
      input: [
        {
          type: 'label',
          label: `+${this.model.get('phoneCode')}`,
          className: 'phone-authenticator-enroll__phone-code',
        },
        Object.assign({}, phoneNumberUISchema),
      ],
    };

    const extensionUISchema = {
      label: loc('phone.extention.label', 'login'),
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
    this.listenTo(this.model, 'change:authenticator.methodType', this.render.bind(this));
    this.listenTo(this.model, 'change:phoneCode', this.handlePhoneCodeChange.bind(this));
  },
});

export default BaseAuthenticatorView.extend({

  Body,
  Footer: AuthenticatorEnrollFooter,

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
        phoneCode: {
          deps: [ 'country' ],
          fn: function (country) {
            return CountryUtil.getCallingCodeForCountry(country);
          },
        },
      },
      ModelClass.prototype.derived,
    );
    return ModelClass.extend({
      local,
      derived,
      toJSON: function () {
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
