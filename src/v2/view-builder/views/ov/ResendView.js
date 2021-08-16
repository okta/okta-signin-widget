import { View, createCallout, _, loc } from 'okta';
import { SHOW_RESEND_TIMEOUT } from '../../utils/Constants';

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
    let content;
    if (this.settings.get('features.includeResendWarningMessages')) {
      let resendMessage;
      if (this.options.appState.containsMessageWithI18nKey(IDX_EMAIL_CODE_NOT_RECEIVED)) {
        resendMessage = loc(`${IDX_EMAIL_CODE_NOT_RECEIVED}`, 'login');
      } else if (this.options.appState.containsMessageWithI18nKey(IDX_SMS_CODE_NOT_RECEIVED)) {
        resendMessage = loc(`${IDX_SMS_CODE_NOT_RECEIVED}`, 'login');
      }

      if (resendMessage) {
        const linkText = selectedChannel === 'email'
          ? loc('email.button.resend', 'login')
          : loc('oie.phone.verify.sms.resendLinkText', 'login');
  
        content = `${resendMessage} <a class='resend-link'>${linkText}</a>`;
      }

    } else {
      content = selectedChannel === 'email'
        ? loc('oie.enroll.okta_verify.email.notReceived', 'login')
        : loc('oie.enroll.okta_verify.sms.notReceived', 'login');        
    }

    if (content) {
      this.add(createCallout({
        content: content,
        type: 'warning',
      }));
    }
  },

  handelResendLink() {
    this.options.appState.trigger('invokeAction', 'currentAuthenticator-resend');
    //hide warning, but reinitiate to show warning again after some threshold of polling
    this.$el.addClass('hide');
    this.showCalloutWithDelay();
  },

  postRender() {
    // If includeResendWarningMessages, the displaying of warning messages will be completely driven
    // by the backend response (i.e. we should not retain message and display it after a delay).
    if (!this.settings.get('features.includeResendWarningMessages')) {
      this.$el.addClass('hide');
      this.showCalloutWithDelay();
    }
  },

  showCalloutWithDelay() {
    this.showMeTimeout = _.delay(() => {
      this.$el.removeClass('hide');
    }, SHOW_RESEND_TIMEOUT);
  },

  remove() {
    View.prototype.remove.apply(this, arguments);
    clearTimeout(this.showMeTimeout);
  }
});
