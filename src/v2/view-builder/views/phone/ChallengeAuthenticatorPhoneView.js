import { loc, createCallout } from '@okta/courage';
import { BaseForm, BaseView } from '../../internals';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';
import BaseResendView from '../shared/BaseResendView';

const ResendView = BaseResendView.extend(
  {
    // To be shown after a timeout
    className: 'phone-authenticator-challenge__resend-warning hide',
    events: {
      'click a.resend-link': 'handleResendLink'
    },

    // Override this to change the resend action location from response
    resendActionKey: 'currentAuthenticatorEnrollment-resend',

    initialize() {
      const resendText = (this.model.get('mode') === 'sms')
        ? loc('oie.phone.verify.sms.resendText', 'login')
        : loc('oie.phone.verify.call.resendText', 'login');
      const linkText = (this.model.get('mode') === 'sms')
        ? loc('oie.phone.verify.sms.resendLinkText', 'login')
        : loc('oie.phone.verify.call.resendLinkText', 'login');
      this.add(createCallout({
        content: `${resendText}&nbsp;<a class='resend-link'>${linkText}</a>`,
        type: 'warning',
      }));
    },

    handleResendLink() {
      this.options.appState.trigger('invokeAction', this.resendActionKey);
      // Hide warning, but start a timeout again..
      if (!this.el.classList.contains('hide')) {
        this.el.classList.add('hide');
      }
      this.showCalloutAfterTimeout();
    },
  },
);

const Body = BaseForm.extend(Object.assign(
  {
    className: 'phone-authenticator-challenge',

    title() {
      return loc('oie.phone.verify.title', 'login');
    },

    save() {
      return loc('mfa.challenge.verify', 'login');
    },

    initialize() {
      BaseForm.prototype.initialize.apply(this, arguments);
      const sendText = (this.model.get('mode') === 'sms')
        ? loc('oie.phone.verify.sms.codeSentText', 'login')
        : loc('mfa.calling', 'login');
      const enterCodeText = loc('oie.phone.verify.enterCodeText', 'login');
      const carrierChargesText = loc('oie.phone.carrier.charges', 'login');
      const isPhoneNumberAvailable = this.model.get('phoneNumber') !== loc('oie.phone.alternate.title', 'login');
      const strongClass = isPhoneNumberAvailable ? 'strong no-translate nowrap' : '';
      
      const nickname = isPhoneNumberAvailable ? this.model.get('nickname') : '';
      const nicknameText = nickname ? ` (${nickname})` : '';
      const extraNicknameCssClasses = nicknameText ? 'no-translate authenticator-verify-nickname' : '';

      const nicknameTemplate = nicknameText 
        ? `<span class="${extraNicknameCssClasses || ''}"}>${nicknameText}.</span>`
        : '<span class="no-translate">.</span>';
      
      // Courage doesn't support HTML, hence creating a subtitle here.
      this.add('<div class="okta-form-subtitle" data-se="o-form-explain">' + 
        `${sendText} ` + 
        `<span class="${strongClass}">${this.model.escape('phoneNumber')}</span>` + 
        `${nicknameTemplate}` + 
        `&nbsp;${enterCodeText}` + 
        `<p>${carrierChargesText}</p>` + 
        '</div>', {
        prepend: true,
        selector: '.o-form-fieldset-container',
      });
    },

    postRender() {
      BaseForm.prototype.postRender.apply(this, arguments);
      this.add(ResendView, {
        selector: '.o-form-info-container',
        prepend: true,
      });
    },
  },
));

export default BaseAuthenticatorView.extend({
  Body,

  createModelClass() {
    const relatesToObject = this.options.currentViewState.relatesTo;
    const { methods, profile, nickname } = relatesToObject?.value || {};
    const ModelClass = BaseView.prototype.createModelClass.apply(this, arguments);
    const local = Object.assign({
      mode: {
        'value': methods[0].type,
        'type': 'string',
      },
      phoneNumber: {
        'value': profile?.phoneNumber ? profile.phoneNumber : loc('oie.phone.alternate.title', 'login'),
        'type': 'string',
      },
      nickname: {
        'value': nickname ? nickname : '',
        'type': 'string',
      }
    }, ModelClass.prototype.local );
    return ModelClass.extend({ local });
  },
});

export { ResendView };