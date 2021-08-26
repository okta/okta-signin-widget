import { View, loc } from 'okta';
import { USER_FEEDBACK_TIMEOUT } from '../../utils/Constants';
import { addUserFeedbackCallout } from '../../utils/ResendViewUtil';
import sessionStorageHelper from '../../../client/sessionStorageHelper';

export default View.extend({
  //only show after certain threshold of polling
  className: 'resend-ov-link-view',
  events: {
    'click a.resend-link' : 'handelResendLink'
  },

  initialize() {
    const resendContext = this.options.appState.get('currentAuthenticator')?.resend;
    this.selectedChannel = this.options.appState.get('currentAuthenticator')?.contextualData?.selectedChannel;

    if (resendContext) {
      const content = this.selectedChannel === 'email' ?
        loc('oie.enroll.okta_verify.email.notReceived', 'login') :
        loc('oie.enroll.okta_verify.sms.notReceived', 'login');

      this.add(`<div class="ion-messages-container">${content}</div>`);
    }

    const start = sessionStorageHelper.getResendTimestamp();
    if (start) {
      const now = Date.now();
      if (now - start < USER_FEEDBACK_TIMEOUT) {
        this.addUserFeedbackCallout();
      }
    }
  },

  handelResendLink() {
    this.options.appState.trigger('invokeAction', 'currentAuthenticator-resend');
    sessionStorageHelper.setResendTimestamp(Date.now());

    const contextualData = this.options.appState.get('currentAuthenticator')?.contextualData;
    let content;
    if (this.selectedChannel === 'email') {
      content = contextualData?.email
        ? `${loc('oie.email.code.user.feedback.with.email', 'login', 
          [this.options.appState.get('currentAuthenticator')?.contextualData.email])}`
        :`${loc('oie.email.code.user.feedback', 'login')}`;
    } else {
      content = contextualData?.phoneNumber
        ? `${loc('oie.sms.code.user.feedback.with.phoneNumber', 'login', 
          [this.options.appState.get('currentAuthenticator')?.contextualData.phoneNumber])}`
        :`${loc('oie.sms.code.user.feedback', 'login')}`;
    }

    this.userFeedbackTimeout = addUserFeedbackCallout(content, this);
    // this.addUserFeedbackCallout();
  },

  // addUserFeedbackCallout() {
  //   const messageCallout = createCallout({
  //     content: this.selectedChannel === 'email' ?
  //       `${loc('oie.email.code.user.feedback.with.email', 'login', 
  //         [this.options.appState.get('currentAuthenticator')?.contextualData.email])}`
  //       :`${loc('oie.sms.code.user.feedback', 'login', 
  //         [this.options.appState.get('currentAuthenticator')?.contextualData.phoneNumber])}`,
  //     type: 'info',
  //   });

  //   // Get message container from the parent since it's not in the scope of this view
  //   // const messageContainer = this.$el.parent().find('.o-form-error-container'); 
  //   // messageContainer.prepend(messageCallout.render().el);

  //   this.add(messageCallout, { prepend: true });

  //   // Dismiss callout after timeout
  //   this.userFeedbackTimeout = setInterval(() => {
  //     const start = sessionStorageHelper.getResendTimestamp();
  //     const now = Date.now();
  //     if (now - start >= USER_FEEDBACK_TIMEOUT) {
  //       messageCallout.remove();
  //       clearInterval(this.userFeedbackTimeout);
  //     }      
  //   }, 500);
  // },

  remove() {
    View.prototype.remove.apply(this, arguments);
    clearTimeout(this.userFeedbackTimeout);
  }
});
