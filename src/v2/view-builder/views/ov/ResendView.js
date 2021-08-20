import { View, createCallout, loc } from 'okta';
import { getMessage } from '../../../ion/i18nTransformer';

const IDX_EMAIL_CODE_NOT_RECEIVED = 'idx.email.code.not.received';
const IDX_SMS_CODE_NOT_RECEIVED = 'idx.sms.code.not.received';

export default View.extend({
  //only show after certain threshold of polling
  className: 'resend-ov-link-view',
  events: {
    'click a.resend-link' : 'handelResendLink'
  },

  initialize() {
    const selectedChannel = this.options.appState.get('currentAuthenticator').contextualData.selectedChannel;
    let resendMessage;

    const i18nEmailMessage = this.options.appState.getMessageWithI18nKey(IDX_EMAIL_CODE_NOT_RECEIVED);
    if (i18nEmailMessage) {
      // Special case: The email i18n key is mapped to our v1 key in i18nTransformer
      resendMessage = getMessage(i18nEmailMessage);
    } else if (this.options.appState.containsMessageWithI18nKey(IDX_SMS_CODE_NOT_RECEIVED)) {
      resendMessage = loc(`${IDX_SMS_CODE_NOT_RECEIVED}`, 'login');
    }

    if (resendMessage) {
      const linkText = selectedChannel === 'email'
        ? loc('email.button.resend', 'login')
        : loc('oie.phone.verify.sms.resendLinkText', 'login');
        
      this.add(createCallout({
        content: `${resendMessage} <a class='resend-link'>${linkText}</a>`,
        type: 'warning',
      }));
    }
  },

  handelResendLink() {
    this.options.appState.trigger('invokeAction', 'currentAuthenticator-resend');
  },

  remove() {
    View.prototype.remove.apply(this, arguments);
    clearTimeout(this.showMeTimeout);
  }
});
