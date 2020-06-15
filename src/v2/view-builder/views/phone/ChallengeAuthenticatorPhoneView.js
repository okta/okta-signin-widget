import {
  loc,
  View,
  createCallout,
  createButton } from 'okta';
import BaseView from '../../internals/BaseView';
import BaseForm from '../../internals/BaseForm';
import BaseFooter from '../../internals/BaseFooter';
import polling from '../shared/polling';
import BaseFactorView from '../shared/BaseFactorView';
import { addSwitchAuthenticatorLink } from '../../utils/AuthenticatorUtil';

const SHOW_RESEND_TIMEOUT = 30000;

const ResendView = View.extend(
  {
    // To be shown after a timeout
    className: 'phone-authenticator-verify__resend-warning hide',
    events: {
      'click a.resend-link': 'handleResendLink'
    },

    initialize () {
      const resendText = (this.model.get('mode') === 'sms')
        ? loc('oie.phone.verify.sms.resendText', 'login')
        : loc('oie.phone.verify.call.resendText', 'login');
      const linkText = (this.model.get('mode') === 'sms')
        ? loc('email.button.resend', 'login')
        : loc('oie.phone.verify.call.resendLinkText', 'login');
      this.add(createCallout({
        content: `${resendText}&nbsp;<a class='resend-link'>${linkText}</a>`,
        type: 'warning',
      }));
    },

    handleResendLink () {
      this.options.appState.trigger('invokeAction', 'currentAuthenticatorEnrollment-resend');
      // Hide warning, but start a timeout again..
      if (!this.el.classList.contains('hide')) {
        this.el.classList.add('hide');
      }
      this.showCalloutAfterTimeout();
    },

    postRender () {
      this.showCalloutAfterTimeout();
    },

    showCalloutAfterTimeout () {
      this.showCalloutTimer = setTimeout(() => {
        this.el.classList.remove('hide');
      }, SHOW_RESEND_TIMEOUT);
    },

    remove () {
      View.prototype.remove.apply(this, arguments);
      clearTimeout(this.showCalloutTimer);
    }
  },
);

const Body = BaseForm.extend(Object.assign(
  {
    className: 'phone-authenticator-verify',
    subtitle: ' ',

    title () {
      return loc('oie.phone.verify.title', 'login');
    },

    save () {
      return loc('oie.verify.button', 'login');
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
            'data-se': 'phone-authenticator-verify__button--primary',
            'type': 'button'
          },
          className: 'button button-primary phone-authenticator-verify__button--primary',
          title: primaryButtonTitle,
          click () {
            // Call the API to send a code via primary mode
            this.options.appState.trigger('invokeAction', 'currentAuthenticatorEnrollment-resend');
            this.model.set('mode', primaryMode);
          },
        })
      );
      if (secondaryMode) {
        const secondaryButtonTitle = (secondaryMode === 'sms')
          ? loc('oie.phone.sms.secondaryButton', 'login')
          : loc('oie.phone.call.secondaryButton', 'login');
        this.add(
          createButton({
            attributes: {
              'data-se': 'phone-authenticator-verify__button--secondary',
              'type': 'button'
            },
            className: 'phone-authenticator-verify__button--secondary',
            title: secondaryButtonTitle,
            click () {
              // Call the API to send a code via secondary mode
              this.options.appState.trigger('invokeAction', 'currentAuthenticatorEnrollment-resend');
              this.model.set('mode', secondaryMode);
            },
          })
        );
      }

      this.listenTo(this.model, 'error', this.startPolling.bind(this));
      this.listenTo(this.model, 'change:mode', this.render.bind(this));
    },

    saveForm () {
      BaseForm.prototype.saveForm.apply(this, arguments);
      this.stopPolling();
      // TODO: abort ongoing request. (https://oktainc.atlassian.net/browse/OKTA-244134)
    },

    /* eslint max-statements: [2, 25]*/
    render (e, mode) {

      BaseForm.prototype.render.apply(this, arguments);

      const buttonBar = this.el.querySelector('.o-form-button-bar');
      const inputFieldset = this.el.querySelector('.o-form-fieldset');
      const subtitleElement = this.el.querySelector('.okta-form-subtitle');
      const primaryButton = this.el.querySelector('.phone-authenticator-verify__button--primary');
      const secondaryButton = this.el.querySelector('.phone-authenticator-verify__button--secondary');

      const maskedPhone = this.options.appState.get('authenticatorProfile').phone;
      if (mode === 'sms' || mode === 'voice') {
        // SMS or Voice code sent screen..
        const sendText = (mode === 'sms')
          ? loc('oie.phone.verify.sms.codeSentText', 'login')
          : loc('mfa.calling', 'login');
        const enterCodeText = loc('oie.phone.verify.enterCodeText', 'login');
  
        // Override message in form subtitle so that we can add html content to it.
        // Courage form subtitle doesn't support html tags.
        subtitleElement.innerText = '';
        this.add(
          `${sendText}&nbsp;<span class='strong'>${maskedPhone}.</span>&nbsp;${enterCodeText}`,
          '.okta-form-subtitle'
        );
        buttonBar.classList.remove('hide');
        inputFieldset.classList.remove('hide');
        primaryButton.classList.add('hide');
        if (secondaryButton) {
          secondaryButton.classList.add('hide');
        }
      } else {
        // Initial Screens - Buttons with send code vis SMS or Voice.
        const sendText = ( this.model.get('primaryMode') === 'sms' )
          ? loc('oie.phone.verify.sms.sendText', 'login')
          : loc('oie.phone.verify.call.sendText', 'login');
        subtitleElement.innerText = '';
        this.add(
          `${sendText}<div><span class="strong">${maskedPhone}</span></div>`,
          '.okta-form-subtitle'
        );
        buttonBar.classList.add('hide');
        inputFieldset.classList.add('hide');
        primaryButton.classList.remove('hide');
        if (secondaryButton) {
          secondaryButton.classList.remove('hide');
        }
      }
    },

    postRender () {
      if (this.model.get('mode') === 'sms' || this.model.get('mode') === 'voice') {
        this.add(ResendView, {
          selector: '.o-form-error-container',
          prepend: true,
        });
        this.startPolling();
      } else {
        const resendView = this.el.querySelector('.phone-authenticator-verify__resend-warning');
        if (resendView) {
          resendView.innerText = '';
        }
        this.stopPolling();
      }
    },

    remove () {
      BaseForm.prototype.remove.apply(this, arguments);
      this.stopPolling();
    }
  },
  polling,
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
    const { methods } = this.options.appState.get('currentAuthenticatorEnrollment');
    const ModelClass = BaseView.prototype.createModelClass.apply(this, arguments);
    const local = Object.assign({
      mode: {
        'value': 'init',
        'type': 'string',
      },
      primaryMode: {
        'value': methods[0].methodType,
        'type': 'string',
      },
      secondaryMode: {
        'value': (methods[1] && methods[1].methodType) || '', // Empty string for falsiness.
        'type': 'string',
      }
    });
    return ModelClass.extend({ local });
  },
});
