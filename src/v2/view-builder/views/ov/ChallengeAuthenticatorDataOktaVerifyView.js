import { BaseFooter } from '../../internals';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';
import ChallengeAuthenticatorDataOktaVerifyPushOnlyBody from './ChallengeAuthenticatorDataOktaVerifyPushOnlyBody';
import ChallengeAuthenticatorDataOktaVerifyBody from './ChallengeAuthenticatorDataOktaVerifyBody';

export default BaseAuthenticatorView.extend({
  initialize() {
    BaseAuthenticatorView.prototype.initialize.apply(this, arguments);
    if (this.isPushOnlyFlow()) {
      this.Body = ChallengeAuthenticatorDataOktaVerifyPushOnlyBody;
    } else {
      this.Body = ChallengeAuthenticatorDataOktaVerifyBody;
      this.Footer = BaseFooter;
    }
  },

  isPushOnlyFlow() {
    const methodType = this.options.appState.getSchemaByName('authenticator.methodType');
    const methodTypeOptions = methodType?.options;
    return methodTypeOptions.length === 1 && methodTypeOptions[0].value === 'push';
  },
});
