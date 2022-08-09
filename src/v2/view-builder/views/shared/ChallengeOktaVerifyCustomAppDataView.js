// Common view for OV push and custom app.
import { BaseFooter } from '../../internals';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';
import ChallengeOktaVerifyCustomAppPushOnlyFormView from './ChallengeOktaVerifyCustomAppPushOnlyFormView';
import ChallengeOktaVerifyCustomAppFormView from './ChallengeOktaVerifyCustomAppFormView';

export default BaseAuthenticatorView.extend({
  initialize() {
    BaseAuthenticatorView.prototype.initialize.apply(this, arguments);
    if (this.isPushOnlyWithAutoChallengeFlow()) {
      this.Body = ChallengeOktaVerifyCustomAppPushOnlyFormView;
    } else {
      this.Body = ChallengeOktaVerifyCustomAppFormView;
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
