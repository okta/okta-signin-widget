import { BaseFooter } from '../../internals';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';
import 
ChallengeAuthenticatorDataOktaVerifyPushOnlyFormView
  from './ChallengeAuthenticatorDataOktaVerifyPushOnlyFormView';
import ChallengeAuthenticatorDataOktaVerifyFormView from './ChallengeAuthenticatorDataOktaVerifyFormView';

export default BaseAuthenticatorView.extend({
  initialize() {
    BaseAuthenticatorView.prototype.initialize.apply(this, arguments);
    if (this.isPushOnlyWithAutoChallengeFlow()) {
      this.Body = ChallengeAuthenticatorDataOktaVerifyPushOnlyFormView;
    } else {
      this.Body = ChallengeAuthenticatorDataOktaVerifyFormView;
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
