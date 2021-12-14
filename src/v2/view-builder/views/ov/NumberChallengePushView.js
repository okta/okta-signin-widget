import { loc } from 'okta';
import { BaseForm } from '../../internals';
import polling from '../shared/polling';
import ResendNumberChallengeView from './ResendNumberChallengeView';
import NumberChallengePhoneView from './NumberChallengePhoneView';

const Body = BaseForm.extend(Object.assign(
  {
    noButtonBar: true,

    className: 'okta-verify-number-challenge',

    events: {
      'click a.resend-number-challenge': 'handleResendNumberChallenge'
    },

    handleResendNumberChallenge() {
      this.options.appState.trigger('invokeAction', 'currentAuthenticator-resend');
      // hide the warning
      this.options.appState.trigger('hideNumberChallengeWarning');
    },

    title() {
      return loc('oie.okta_verify.push.sent', 'login');
    },

    initialize() {
      BaseForm.prototype.initialize.apply(this, arguments);
      this.add(NumberChallengePhoneView);
    },

    triggerAfterError() {
      BaseForm.prototype.triggerAfterError.apply(this, arguments);
      this.stopPolling();
      this.$el.find('.o-form-fieldset-container').empty();
    },

    postRender() {
      BaseForm.prototype.postRender.apply(this, arguments);
      this.startPoll();
    },

    startPoll() {
      this.startPolling();
      this.addWarning();
    },

    stopPoll() {
      this.stopPolling();
    },

    addWarning() {
      this.add(ResendNumberChallengeView, '.o-form-error-container');
      this.options.appState.trigger('showNumberChallengeWarning');
    },

    remove() {
      BaseForm.prototype.remove.apply(this, arguments);
      this.stopPolling();
    },
  },

  polling,
));

export default Body;
