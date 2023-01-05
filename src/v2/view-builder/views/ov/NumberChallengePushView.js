import { loc } from '@okta/courage';
import { BaseFormWithPolling } from '../../internals';
import polling from '../shared/polling';
import ResendNumberChallengeView from './ResendNumberChallengeView';
import NumberChallengePhoneView from './NumberChallengePhoneView';

const Body = BaseFormWithPolling.extend(Object.assign(
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
      BaseFormWithPolling.prototype.initialize.apply(this, arguments);
      this.add(NumberChallengePhoneView);
    },

    triggerAfterError() {
      BaseFormWithPolling.prototype.triggerAfterError.apply(this, arguments);
      this.stopPolling();
      this.$el.find('.o-form-fieldset-container').empty();
    },

    postRender() {
      BaseFormWithPolling.prototype.postRender.apply(this, arguments);
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
      BaseFormWithPolling.prototype.remove.apply(this, arguments);
      this.stopPolling();
    },
  },

  polling,
));

export default Body;
