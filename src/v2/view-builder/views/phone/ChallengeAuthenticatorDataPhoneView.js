import { _, loc } from '@okta/courage';
import { BaseForm, BaseView } from '../../internals';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';

const Body = BaseForm.extend(
  {
    className: 'phone-authenticator-challenge',
    events: {
      'click a.phone-authenticator-challenge__link': 'handleSecondaryLinkClick'
    },

    title() {
      return loc('oie.phone.verify.title', 'login');
    },

    save() {
      return (this.model.get('primaryMode') === 'sms')
        ? loc('oie.phone.sms.primaryButton', 'login')
        : loc('oie.phone.call.primaryButton', 'login');
    },

    handleSecondaryLinkClick(e) {
      e.preventDefault();
      // Call the API to send a code via secondary mode
      const secondaryMode = this.model.get('secondaryMode');
      this.model.set('authenticator.methodType', secondaryMode);
      this.saveForm(this.model);
    },

    initialize() {
      // This is needed when user clicks on secondary (say voice) and call fails with ratelimit server-side error.
      // Then the user clicks primary button (say sms) and right methodType needs to be sent.
      this.model.on('error', () => this.model.set('authenticator.methodType', this.model.get('primaryMode')));
      BaseForm.prototype.initialize.apply(this, arguments);
      const sendText = (this.model.get('primaryMode') === 'sms')
        ? loc('oie.phone.verify.sms.sendText', 'login')
        : loc('oie.phone.verify.call.sendText', 'login');
      const carrierChargesText = loc('oie.phone.carrier.charges', 'login');
      const isPhoneNumberAvailable = this.model.get('phoneNumber') !== loc('oie.phone.alternate.title', 'login');
      const extraCssClasses = isPhoneNumberAvailable ? 'strong no-translate nowrap' : '';
      
      const nickname = isPhoneNumberAvailable ? this.model.get('nickname') : '';
      const nicknameText = nickname ? ` (${nickname})` : '';
      const extraNicknameCssClasses = nicknameText ? 'no-translate authenticator-verify-nickname' : '';

      const nicknameTemplate = nicknameText 
        ? `<span class="${extraNicknameCssClasses || ''}">${nicknameText}.</span>`
        : '<span class="no-translate">.</span>';
      // Courage doesn't support HTML, hence creating a subtitle here.
      const content = `${sendText} ` + 
        `<span ${extraCssClasses ? ` class="${extraCssClasses}"` : ''}>${this.model.escape('phoneNumber')}</span>` + 
        `${nicknameTemplate}`;
      this.add('<div class="okta-form-subtitle" data-se="o-form-explain">' + 
        `${content}` + 
        `<p>${carrierChargesText}</p>` + 
        '</div>'
      );
    },

    getUISchema() {
      // Change the UI schema to not display radios here.
      const uiSchemas = BaseForm.prototype.getUISchema.apply(this, arguments);
      return uiSchemas.filter(schema => schema.name !== 'authenticator.methodType');
    },

    render() {
      BaseForm.prototype.render.apply(this, arguments);
      const secondaryMode = this.model.get('secondaryMode');
      if (secondaryMode) {
        const secondaryButtonTitle = (secondaryMode === 'sms')
          ? loc('oie.phone.sms.secondaryButton', 'login')
          : loc('oie.phone.call.secondaryButton', 'login');
        this.add(
          `<a href="#"
            class="link phone-authenticator-challenge__link"
            data-se="phone-authenticator-challenge__link">${secondaryButtonTitle}</a>`,
          '.o-form-button-bar');
      }
    },
  },
);

export default BaseAuthenticatorView.extend({
  Body,

  createModelClass({ uiSchema }) {
    // It is important to get methods from here to maintain single source of truth.
    const { options: methods } = _.find(uiSchema, schema => schema.name === 'authenticator.methodType');
    const relatesToObject = this.options.currentViewState.relatesTo;
    const { profile, nickname } = relatesToObject?.value || {};
    const ModelClass = BaseView.prototype.createModelClass.apply(this, arguments);
    const local = Object.assign({
      primaryMode: {
        'value': methods[0].value,
        'type': 'string',
      },
      secondaryMode: {
        'value': methods[1] && methods[1].value,
        'type': 'string',
      },
      phoneNumber: {
        'value': profile?.phoneNumber ? profile.phoneNumber : loc('oie.phone.alternate.title', 'login'),
        'type': 'string',
      },
      nickname: {
        'value': nickname ? nickname : '',
        'type': 'string',
      },
    }, ModelClass.prototype.local);
    return ModelClass.extend({ local });
  },
});
