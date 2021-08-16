import { loc, View, createCallout } from 'okta';
import { BaseForm, BaseView } from '../../internals';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';
import { SHOW_RESEND_TIMEOUT } from '../../utils/Constants';
import { MESSAGE_CLASS } from '../../../ion/RemediationConstants';


const IDX_CALL_CODE_NOT_RECEIVED = 'idx.phone.call.not.received';
const IDX_SMS_CODE_NOT_RECEIVED = 'idx.sms.code.not.received';

const ResendView = View.extend(
  {
    // To be shown after a timeout
    className: 'phone-authenticator-challenge__resend-warning',
    events: {
      'click a.resend-link': 'handleResendLink'
    },

    // Override this to change the resend action location from response
    resendActionKey: 'currentAuthenticatorEnrollment-resend',

    initialize() {
      let resendMessage;
      if (this.settings.get('features.includeResendWarningMessages')) {
        if (this.options.appState.containsMessageWithI18nKey(IDX_CALL_CODE_NOT_RECEIVED)) {
          resendMessage = loc(`${IDX_CALL_CODE_NOT_RECEIVED}`, 'login');
        } else if (this.options.appState.containsMessageWithI18nKey(IDX_SMS_CODE_NOT_RECEIVED)) {
          resendMessage = loc(`${IDX_SMS_CODE_NOT_RECEIVED}`, 'login');
        }
      } else {
        resendMessage = (this.model.get('mode') === 'sms')
          ? loc('oie.phone.verify.sms.resendText', 'login')
          : loc('oie.phone.verify.call.resendText', 'login');
      }

      const linkText = (this.model.get('mode') === 'sms')
        ? loc('oie.phone.verify.sms.resendLinkText', 'login')
        : loc('oie.phone.verify.call.resendLinkText', 'login');
        
      if (resendMessage) {
        this.add(createCallout({
          content: `${resendMessage} <a class='resend-link'>${linkText}</a>`,
          type: 'warning',
        }));
      }
    },

    handleResendLink() {
      this.options.appState.trigger('invokeAction', this.resendActionKey);

      // With the this feature on, UI should be stateless so no need to do the operations below
      if (this.settings.get('features.includeResendWarningMessages')) {
        return;
      } 

      // Hide warning, but start a timeout again..
      if (!this.el.classList.contains('hide')) {
        this.el.classList.add('hide');
      }
      this.showCalloutAfterTimeout();
    },

    postRender() {
      // If includeResendWarningMessages, the displaying of warning messages will be completely driven
      // by the backend response (i.e. we should not retain message and display it after a delay).
      if (!this.settings.get('features.includeResendWarningMessages')) {
        this.el.classList.add('hide');
        this.showCalloutAfterTimeout();
      }      
    },

    showCalloutAfterTimeout() {
      this.showCalloutTimer = setTimeout(() => {
        this.el.classList.remove('hide');
      }, SHOW_RESEND_TIMEOUT);
    },

    remove() {
      View.prototype.remove.apply(this, arguments);
      clearTimeout(this.showCalloutTimer);
    }
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

      const strongClass = this.model.get('phoneNumber') !== loc('oie.phone.alternate.title', 'login') ?
        'strong no-translate' : '';
      // Courage doesn't support HTML, hence creating a subtitle here.
      this.add(`<div class="okta-form-subtitle" data-se="o-form-explain">
        ${sendText}&nbsp;<span class='${strongClass}'>${this.model.escape('phoneNumber')}.</span>
        &nbsp;${enterCodeText}
        <p>${carrierChargesText}</p>
        </div>`, {
        prepend: true,
        selector: '.o-form-fieldset-container',
      });
    },

    showMessages() {
      // render messages as text
      const messagesObjs = this.options.appState.get('messages');
      if (messagesObjs?.value.length) {
        const content = messagesObjs.value
          // We don't display messages of class WARN in showMessages because the ResendView above has custom
          // logic that updates the message before displaying so we solely rely on that logic.
          .filter(messagesObj => messagesObj?.class !== MESSAGE_CLASS.WARN)
          .map((messagesObj) => {
            return messagesObj.message;
          });
        this.add(`<div class="ion-messages-container">${content.join(' ')}</div>`, '.o-form-error-container');
      }
    },

    postRender() {
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

  createModelClass() {
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