import {
  loc,
  createButton } from 'okta';
import BaseView from '../../internals/BaseView';
import BaseForm from '../../internals/BaseForm';
import BaseFooter from '../../internals/BaseFooter';
import BaseFactorView from '../shared/BaseFactorView';
import { addSwitchAuthenticatorLink } from '../../utils/AuthenticatorUtil';

const Body = BaseForm.extend(Object.assign(
  {
    className: 'phone-authenticator-challenge',
    subtitle: ' ',

    title () {
      return loc('oie.phone.verify.title', 'login');
    },

    noSubmitButton: true,

    saveForm () {
      BaseForm.prototype.saveForm.call(this, this.model);
    },

    initialize () {
      BaseForm.prototype.initialize.apply(this, arguments);
      const primaryMode = this.model.get('primaryMode');
      const secondaryMode = this.model.get('secondaryMode');
      const primaryButtonTitle = (primaryMode === 'sms')
        ? loc('oie.phone.sms.primaryButton', 'login')
        : loc('oie.phone.call.primaryButton', 'login');

      this.add(
        createButton({
          attributes: {
            'data-se': 'phone-authenticator-challenge__button--primary',
            'type': 'button'
          },
          className: 'button button-primary phone-authenticator-challenge__button--primary',
          title: primaryButtonTitle,
          click: function () {
            // Call the API to send a code via primary mode
            this.model.set('authenticator.methodType', primaryMode);
            this.saveForm.call(this, arguments);
          }.bind(this),
        })
      );
      if (secondaryMode) {
        const secondaryButtonTitle = (secondaryMode === 'sms')
          ? loc('oie.phone.sms.secondaryButton', 'login')
          : loc('oie.phone.call.secondaryButton', 'login');
        this.add(
          createButton({
            attributes: {
              'data-se': 'phone-authenticator-challenge__button--secondary',
              'type': 'button'
            },
            className: 'phone-authenticator-challenge__button--secondary',
            title: secondaryButtonTitle,
            click: function () {
              // Call the API to send a code via secondary mode
              this.model.set('authenticator.methodType', secondaryMode);
              this.saveForm.call(this, arguments);
            }.bind(this),
          })
        );
      }
    },

    render () {
      BaseForm.prototype.render.apply(this, arguments);
      const buttonBar = this.el.querySelector('.o-form-button-bar');
      const subtitleElement = this.el.querySelector('.okta-form-subtitle');
      const sendText = ( this.model.get('primaryMode') === 'sms' )
        ? loc('oie.phone.verify.sms.sendText', 'login')
        : loc('oie.phone.verify.call.sendText', 'login');
      subtitleElement.innerText = '';
      this.add(
        `${sendText}<div><span class="strong">${this.model.get('phoneNumber')}</span></div>`,
        '.okta-form-subtitle'
      );
      buttonBar.classList.add('hide');
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

  createModelClass () {
    const { methods, profile } = this.options.appState.get('currentAuthenticatorEnrollment');
    const ModelClass = BaseView.prototype.createModelClass.apply(this, arguments);
    const local = Object.assign({
      primaryMode: {
        'value': methods[0].type,
        'type': 'string',
      },
      secondaryMode: {
        'value': methods[1] && methods[1].type,
        'type': 'string',
      },
      phoneNumber: {
        'value': profile.phoneNumber,
        'type': 'string',
      },
    });
    return ModelClass.extend({ local });
  },
});
