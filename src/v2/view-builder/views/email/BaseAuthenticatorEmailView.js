import { loc, View, createCallout, _ } from 'okta';
import { BaseForm } from '../../internals';
import email from '../shared/email';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';
import { SHOW_RESEND_TIMEOUT } from '../../utils/Constants';
import BaseFormWithPolling from '../../internals/BaseFormWithPolling';
import { MESSAGE_CLASS } from '../../../ion/RemediationConstants';

const IDX_EMAIL_CODE_NOT_RECEIVED = 'idx.email.code.not.received';

const ResendView = View.extend(
  {
    className: 'resend-email-view',
    events: {
      'click a.resend-link' : 'handelResendLink'
    },

    initialize() {
      let resendMessage;
      if (this.settings.get('features.includeResendWarningMessages')) {
        if (this.options.appState.containsMessageWithI18nKey(IDX_EMAIL_CODE_NOT_RECEIVED)) {
          resendMessage = loc(`${IDX_EMAIL_CODE_NOT_RECEIVED}`, 'login');
        }
      } else {
        resendMessage = loc('email.code.not.received', 'login');
      }

      if (resendMessage) {
        this.add(createCallout({
          content: `${resendMessage}
          <a class='resend-link'>${loc('email.button.resend', 'login')}</a>`,
          type: 'warning',
        }));
      }
    },

    handelResendLink() {
      this.options.appState.trigger('invokeAction', this.options.resendEmailAction);
      
      // With the this feature on, UI should be stateless so no need to do the operations below
      if (this.settings.get('features.includeResendWarningMessages')) {
        return;
      } 

      // Hide warning, but reinitiate to show warning again after some threshold of polling
      if (!this.$el.hasClass('hide')) {
        this.$el.addClass('hide');
      }
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
  },
);

const Body = BaseFormWithPolling.extend(Object.assign(
  {
    save() {
      return loc('mfa.challenge.verify', 'login');
    },
    initialize() {
      BaseFormWithPolling.prototype.initialize.apply(this, arguments);

      this.add(ResendView, {
        selector: '.o-form-error-container',
        options: {
          resendEmailAction: this.resendEmailAction,
        }
      });
      this.startPolling();
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

    saveForm() {
      BaseForm.prototype.saveForm.apply(this, arguments);
      this.stopPolling();
    },

    remove() {
      BaseForm.prototype.remove.apply(this, arguments);
      this.stopPolling();
    },

    triggerAfterError(model, error) {
      BaseForm.prototype.triggerAfterError.apply(this, arguments);
      const isFormPolling = !!this.polling;
      this.stopPolling();

      if (error.responseJSON?.errorSummaryKeys?.includes('idx.session.expired')) {
        // Do NOT resume polling since session is invalid and polling is already stopped
        return;
      }

      if (this.isRateLimitError(error)) {
        // When polling encounter rate limit error, wait 60 sec for rate limit bucket to reset
        // before polling again & hide error message
        if (isFormPolling) {
          setTimeout(() => {
            model.trigger('clearFormError');
          }, 0);
        }
        this.startPolling(60000);
      } else {
        this.startPolling(this.options.appState.get('dynamicRefreshInterval'));
      }
    },

    isRateLimitError(error) {
      return (error.responseJSON?.errorSummaryKeys?.includes('tooManyRequests') ||
        error.responseJSON?.errorCode === 'E0000047') &&
        !error.responseJSON?.errorIntent;
    },
  },
  email,
));

export default BaseAuthenticatorView.extend({
  Body,
});
