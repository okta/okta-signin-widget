import {
  _,
  loc } from 'okta';
import BaseView from '../../internals/BaseView';
import BaseForm from '../../internals/BaseForm';
import BaseFooter from '../../internals/BaseFooter';
import BaseFactorView from '../shared/BaseFactorView';
import { addSwitchAuthenticatorLink } from '../../utils/AuthenticatorUtil';

const Body = BaseForm.extend(Object.assign(
  {
    className: 'phone-authenticator-challenge',
    events: {
      'click a.phone-authenticator-challenge__link' : 'handleSecondaryLinkClick'
    },

    title () {
      return loc('oie.phone.verify.title', 'login');
    },

    save () {
      return (this.model.get('primaryMode') === 'sms')
        ? loc('oie.phone.sms.primaryButton', 'login')
        : loc('oie.phone.call.primaryButton', 'login');
    },

    handleSecondaryLinkClick () {
      // Call the API to send a code via secondary mode
      const secondaryMode = this.model.get('secondaryMode');
      this.model.set('authenticator.methodType', secondaryMode);
      this.saveForm(this.model);
    },

    initialize () {
      BaseForm.prototype.initialize.apply(this, arguments);
      const sendText = ( this.model.get('primaryMode') === 'sms' )
        ? loc('oie.phone.verify.sms.sendText', 'login')
        : loc('oie.phone.verify.call.sendText', 'login');
      // Courage doesn't support HTML, hence creating a subtitle here.
      this.add(`<div class="okta-form-subtitle" data-se="o-form-explain">${sendText}
        <div><span class="strong">${this.model.escape('phoneNumber')}</span></div>
        </div>`);
    },

    render () {
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
));

const Footer = BaseFooter.extend({
  links () {
    const links = [];
    addSwitchAuthenticatorLink(this.options.appState, links);
    return links;
  }
});

export default BaseFactorView.extend({
  Body,
  Footer,

  createModelClass ({ uiSchema }) {
    // It is important to get methods from here to maintain single source of truth.
    const { options: methods } = _.find(uiSchema, schema => schema.name === 'authenticator.methodType');
    const { profile } = this.options.appState.get('currentAuthenticatorEnrollment');
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
        'value': profile.phoneNumber,
        'type': 'string',
      },
    }, ModelClass.prototype.local);
    return ModelClass.extend({ local });
  },
});
