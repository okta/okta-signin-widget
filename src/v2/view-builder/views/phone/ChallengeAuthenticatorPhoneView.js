import { loc, View, createCallout } from 'okta';
import { BaseForm, BaseView } from '../../internals';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';
import { SHOW_RESEND_TIMEOUT } from '../../utils/Constants';

const ResendView = View.extend(
  {
    // To be shown after a timeout
    className: 'phone-authenticator-challenge__resend-warning hide',
    events: {
      'click a.resend-link': 'handleResendLink'
    },

    // Override this to change the resend action location from response
    resendActionKey: 'currentAuthenticatorEnrollment-resend',

    initialize () {
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

    handleResendLink () {
      this.options.appState.trigger('invokeAction', this.resendActionKey);
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
    className: 'phone-authenticator-challenge',

    title () {
      return loc('oie.phone.verify.title', 'login');
    },

    save () {
      return loc('mfa.challenge.verify', 'login');
    },

    initialize () {
      BaseForm.prototype.initialize.apply(this, arguments);
      const sendText = (this.model.get('mode') === 'sms')
        ? loc('oie.phone.verify.sms.codeSentText', 'login')
        : loc('mfa.calling', 'login');
      const enterCodeText = loc('oie.phone.verify.enterCodeText', 'login');

      const strongClass = this.model.get('phoneNumber') !== loc('oie.phone.alternate.title', 'login') ? 'strong' : '';
      // Courage doesn't support HTML, hence creating a subtitle here.
      this.add(`<div class="okta-form-subtitle" data-se="o-form-explain">
        ${sendText}&nbsp;<span class='${strongClass}'>${this.model.escape('phoneNumber')}.</span>
        &nbsp;${enterCodeText}</div>`, {
        prepend: true,
        selector: '.o-form-fieldset-container',
      });
    },

    postRender () {
      BaseForm.prototype.postRender.apply(this, arguments);
      this.add(ResendView, {
        selector: '.o-form-error-container',
        prepend: true,
      });
    },
  },
));

export default BaseAuthenticatorView.extend({
  Body,

  createModelClass () {
    const relatesToObject = this.options.currentViewState.relatesTo;
    const { methods, profile } = relatesToObject?.value || {};
    const ModelClass = BaseView.prototype.createModelClass.apply(this, arguments);
    const local = Object.assign({
      mode: {
        'value': methods[0].type,
        'type': 'string',
      },
      phoneNumber: {
        'value': profile?.phoneNumber ? profile.phoneNumber : loc('oie.phone.alternate.title', 'login'),
        'type': 'string',
      }
    }, ModelClass.prototype.local );
    return ModelClass.extend({ local });
  },
});

export { ResendView };