import { loc, View, createCallout, _ } from 'okta';
import BaseForm from '../../internals/BaseForm';
import email from '../shared/email';
import polling from '../shared/polling';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';
import { SHOW_RESEND_TIMEOUT } from '../../utils/Constants';

const ResendView = View.extend(
  {
    className: 'hide resend-email-view',
    events: {
      'click a.resend-link' : 'handelResendLink'
    },

    initialize () {
      this.add(createCallout({
        content: `${loc('email.code.not.received', 'login')}
        <a class='resend-link'>${loc('email.button.resend', 'login')}</a>`,
        type: 'warning',
      }));
    },

    handelResendLink () {
      this.options.appState.trigger('invokeAction', this.options.resendEmailAction);
      // Hide warning, but reinitiate to show warning again after some threshold of polling
      if (!this.$el.hasClass('hide')) {
        this.$el.addClass('hide');
      }
      this.showCalloutWithDelay();
    },

    postRender () {
      this.showCalloutWithDelay();
    },

    showCalloutWithDelay () {
      this.showMeTimeout = _.delay(() => {
        this.$el.removeClass('hide');
      }, SHOW_RESEND_TIMEOUT);
    },

    remove () {
      View.prototype.remove.apply(this, arguments);
      clearTimeout(this.showMeTimeout);
    }
  },
);

const Body = BaseForm.extend(Object.assign(
  {
    save () {
      return loc('mfa.challenge.verify', 'login');
    },
    initialize () {
      BaseForm.prototype.initialize.apply(this, arguments);

      this.add(ResendView, {
        selector: '.o-form-error-container',
        options: {
          resendEmailAction: this.resendEmailAction,
        }
      });
      this.startPolling();
    },

    saveForm () {
      BaseForm.prototype.saveForm.apply(this, arguments);
      this.stopPolling();
    },

    remove () {
      BaseForm.prototype.remove.apply(this, arguments);
      this.stopPolling();
    },

    triggerAfterError (model, error) {
      BaseForm.prototype.triggerAfterError.apply(this, arguments);
      this.stopPolling();

      // Polling needs to be resumed if it's a form error and session is still valid
      if(error.responseJSON.errorMessageKey !== 'idx.session.expired') {
        this.startPolling();
      }
    }
  },

  email,
  polling,
));

export default BaseAuthenticatorView.extend({
  Body,
});
