import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';
import ChallengeOktaVerifyPushView from './ChallengeOktaVerifyPushView';
import ChallengeOktaVerifyFastPassView from './ChallengeOktaVerifyFastPassView';
import NumberChallengePushView from './NumberChallengePushView';
import { AUTHENTICATOR_METHODS } from '../../../ion/RemediationConstants';

export default BaseAuthenticatorView.extend({
  initialize () {
    BaseAuthenticatorView.prototype.initialize.apply(this, arguments);
    const currentAuthenticator = this.options?.appState?.get('currentAuthenticator');
    const selectedMethod = currentAuthenticator?.methods[0];
    if (selectedMethod?.type === AUTHENTICATOR_METHODS.PUSH &&
      currentAuthenticator?.contextualData?.correctAnswer) {
      this.Body = NumberChallengePushView;
    } else if (selectedMethod?.type === AUTHENTICATOR_METHODS.PUSH) {
      this.Body = ChallengeOktaVerifyPushView;
    } else {
      this.Body = ChallengeOktaVerifyFastPassView;
    }
  },
});
