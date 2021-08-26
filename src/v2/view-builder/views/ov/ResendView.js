import { View, createCallout, loc, _ } from 'okta';
import hbs from 'handlebars-inline-precompile';
import { USER_FEEDBACK_TIMEOUT } from '../../utils/Constants';
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
      // this.add(createCallout({
      //   content: this.selectedChannel === 'email' ?
      //     hbs `{{{i18n code="oie.enroll.okta_verify.email.notReceived" bundle="login"}}}`:
      //     hbs `{{{i18n code="oie.enroll.okta_verify.sms.notReceived" bundle="login"}}}`,
      //   type: 'warning',
      // }));

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

    this.addUserFeedbackCallout();

    //hide warning, but reinitiate to show warning again after some threshold of polling
    // this.$el.addClass('hide');
    // this.showCalloutWithDelay();
  },

  addUserFeedbackCallout() {
    const messageCallout = createCallout({
      content: this.selectedChannel === 'email' ?
        `${loc('oie.email.code.user.feedback', 'login', 
          [this.options.appState.get('currentAuthenticator')?.contextualData.email])}`
        :`${loc('oie.sms.code.user.feedback', 'login', 
          [this.options.appState.get('currentAuthenticator')?.contextualData.phoneNumber])}`,
      type: 'info',
    });

    const messageContainer = this.$el.parent().find('.o-form-error-container'); 
    messageContainer.prepend(messageCallout.render().el);
    
    // this.add(messageCallout, {
    //   prepend: true,
    //   // selector: '.o-form-content .o-form-error-container',
    // });

    this.userFeedbackTimeout = setInterval(() => {
      const start = sessionStorageHelper.getResendTimestamp();
      const now = Date.now();
      if (now - start >= USER_FEEDBACK_TIMEOUT) {
        messageCallout.remove();
        clearInterval(this.userFeedbackTimeout);
      }      
    }, 500);
  },

  remove() {
    View.prototype.remove.apply(this, arguments);
    clearTimeout(this.userFeedbackTimeout);
  }
});
