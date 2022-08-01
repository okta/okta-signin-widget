// Common view for OV push and custom push.
import { BaseFooter } from '../../internals';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';
import
ChallengeAuthenticatorDataPushOnlyFormView
  from './ChallengeAuthenticatorDataPushOnlyFormView';
import ChallengeAuthenticatorDataFormView from './ChallengeAuthenticatorDataFormView';

export default BaseAuthenticatorView.extend({
  initialize() {
    BaseAuthenticatorView.prototype.initialize.apply(this, arguments);
    if (this.isPushOnlyWithAutoChallengeFlow()) {
      this.Body = ChallengeAuthenticatorDataPushOnlyFormView;
    } else {
      this.Body = ChallengeAuthenticatorDataFormView;
      this.Footer = BaseFooter;
    }
  },

  isPushOnlyWithAutoChallengeFlow() {
    const methodType = this.options.appState.getSchemaByName('authenticator.methodType');
    const hasAutoChallengeSchema = this.options.appState.getSchemaByName('authenticator.autoChallenge');
    const methodTypeOptions = methodType?.options;
    return hasAutoChallengeSchema && methodTypeOptions.length === 1 && methodTypeOptions[0].value === 'push';
  },
});
