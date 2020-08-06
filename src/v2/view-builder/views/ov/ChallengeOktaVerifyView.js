import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';
import AuthenticatorVerifyFooter from '../../components/AuthenticatorVerifyFooter';
import ChallengeOktaVerifyTotpView from './ChallengeOktaVerifyTotpView';
import ChallengeOktaVerifyFastPassView from './ChallengeOktaVerifyFastPassView';

export default BaseAuthenticatorView.extend({
  initialize () {
    BaseAuthenticatorView.prototype.initialize.apply(this, arguments);

    const currentAuthenticator = this.options?.appState?.get('currentAuthenticator');
    const selectedMethod = currentAuthenticator?.methods[0];
    if (selectedMethod?.methodType === 'totp') {
      this.Body = ChallengeOktaVerifyTotpView;
      this.Footer = AuthenticatorVerifyFooter;
    } else {
      this.Body = ChallengeOktaVerifyFastPassView;
    }
  },
});
