import { loc, createCallout } from '@okta/courage';
import { BaseForm } from '../../internals';
import email from '../shared/email';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';
import BaseResendView from '../shared/BaseResendView';
import BaseFormWithPolling from '../../internals/BaseFormWithPolling';

const ResendView = BaseResendView.extend(
  {
    className: 'hide resend-email-view',
    events: {
      'click a.resend-link' : 'handelResendLink'
    },

    initialize() {
      this.add(createCallout({
        content: `${loc('email.code.not.received', 'login')}
        <a class='resend-link'>${loc('email.button.resend', 'login')}</a>`,
        type: 'warning',
      }));
    },

    handelResendLink() {
      this.options.appState.trigger('invokeAction', this.options.resendEmailAction);
      // Hide warning, but reinitiate to show warning again after some threshold of polling
      if (!this.$el.hasClass('hide')) {
        this.$el.addClass('hide');
      }
      this.showCalloutAfterTimeout();
    },
  },
);

const Body = BaseFormWithPolling.extend(Object.assign(
  {
    save() {
      return loc('mfa.challenge.verify', 'login');
    },
    initialize() {
      BaseFormWithPolling.prototype.initialize.apply(this, arguments);
      this.startPolling();
    },

    postRender() {
      BaseForm.prototype.postRender.apply(this, arguments);

      // Add 1 instance of resend view
      if (!this.$el.find('.resend-email-view').length) {
        this.add(ResendView, {
          selector: '.o-form-error-container',
          prepend: true,
          options: {
            resendEmailAction: this.resendEmailAction,
          }
        });
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
      return (error.responseJSON?.errorSummaryKeys?.includes('tooManyRequests') // IDX API error
        || (error.responseJSON?.errorCode === 'E0000047') && !error.responseJSON?.errorIntent); // Standard API error
    },
  },
  email,
));

export default BaseAuthenticatorView.extend({
  Body,
});
