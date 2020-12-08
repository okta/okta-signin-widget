import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';
import AuthenticatorVerifyFooter from '../../components/AuthenticatorVerifyFooter';
import ChallengeOktaVerifyPushView from './ChallengeOktaVerifyPushView';
import ChallengeOktaVerifyFastPassView from './ChallengeOktaVerifyFastPassView';

export default BaseAuthenticatorView.extend({
  initialize () {
    BaseAuthenticatorView.prototype.initialize.apply(this, arguments);

    const currentAuthenticator = this.options?.appState?.get('currentAuthenticator');
    const selectedMethod = currentAuthenticator?.methods[0];
    if (selectedMethod?.type === 'push') {
      this.Body = ChallengeOktaVerifyPushView;
      this.Footer = AuthenticatorVerifyFooter;
    } else {
      this.Body = ChallengeOktaVerifyFastPassView;
      if (ChallengeOktaVerifyFastPassView.isSwitchAuthenticatorRequired(this.options)) {
        this.Footer = AuthenticatorVerifyFooter;
      }
    }
  },
});
