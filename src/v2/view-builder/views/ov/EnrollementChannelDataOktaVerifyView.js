import { loc, _, Model } from '@okta/courage';
import { BaseForm, BaseView } from '../../internals';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';
import CountryUtil from '../../../../util/CountryUtil';
import SwitchEnrollChannelLinkView from './SwitchEnrollChannelLinkView';

const Body = BaseForm.extend({
  className: 'oie-enroll-ov-data',
  title() {
    return this.options.appState.get('currentAuthenticator').contextualData.selectedChannel === 'email' ?
      loc('oie.enroll.okta_verify.enroll.channel.email.title', 'login'):
      loc('oie.enroll.okta_verify.enroll.channel.sms.title', 'login');
  },

  save() {
    return loc('oie.enroll.okta_verify.setupLink', 'login');
  },

  getUISchema() {
    const uiSchemas = BaseForm.prototype.getUISchema.apply(this, arguments);
    const phoneNumberUISchema = _.find(uiSchemas, ({ name }) => name === 'phoneNumber');
    const phoneNumberUISchemaIndex = _.findIndex(uiSchemas, ({ name }) => name === 'phoneNumber');

    const countryUISchema = {
      'label-top': true,
      label: loc('mfa.country', 'login'),
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
      input: [
        {
          type: 'label',
          /* eslint-disable-next-line @okta/okta/no-unlocalized-text */
          label: `+${this.model.get('phoneCode')}`,
          className: 'country-code-label no-translate',
        },
        Object.assign({}, phoneNumberUISchema),
      ],
    };

    if (phoneNumberUISchemaIndex !== -1) {
      // Replace phoneNumberUISchema and add countryUISchema before phone.
      uiSchemas.splice(phoneNumberUISchemaIndex, 1, countryUISchema, phoneNumberWithCodeUISchema);
    }

    const description = {
      View: this.options.appState.get('currentAuthenticator').contextualData.selectedChannel === 'email' ?
        loc('oie.enroll.okta_verify.enroll.channel.email.subtitle', 'login'):
        loc('oie.enroll.okta_verify.channel.sms.description.updated', 'login'),
      selector: '.o-form-fieldset-container',
    };

    uiSchemas.push(description);
    return uiSchemas;
  },

  handlePhoneCodeChange() {
    const countryCodeField = this.el.querySelector('.country-code-label');
    countryCodeField.innerText = `+${this.model.get('phoneCode')}`;
  },

  initialize() {
    BaseForm.prototype.initialize.apply(this, arguments);
    if (this.options.appState.get('currentAuthenticator').contextualData.selectedChannel === 'sms') {
      this.listenTo(this.model, 'change:phoneCode', this.handlePhoneCodeChange.bind(this));
    }
  },
});

export default BaseAuthenticatorView.extend({
  Body,
  createModelClass() {
    const ModelClass = BaseView.prototype.createModelClass.apply(this, arguments);
    if (this.options.appState.get('currentAuthenticator').contextualData.selectedChannel !== 'sms') {
      return ModelClass;
    }
    const local = Object.assign(
      {
        country: {
          // Set default country to "US"
          'value': this.settings.get('defaultCountryCode'),
          'type': 'string',
        },
      },
      ModelClass.prototype.local,
    );
    const derived = Object.assign(
      {
        phoneCode: {
          deps: [ 'country'],
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
        const phoneCode = this.get('phoneCode');

        // Add country code..
        let formattedPhoneNumber = `+${phoneCode}${modelJSON.phoneNumber}`;

        // Override phone with formatted number..
        modelJSON.phoneNumber = formattedPhoneNumber;
        return modelJSON;
      },
    });
  },
  postRender() {
    this.add(SwitchEnrollChannelLinkView, 'form');
  },
});
