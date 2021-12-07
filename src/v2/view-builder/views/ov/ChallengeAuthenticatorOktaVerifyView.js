import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';
import { 
  Body as ChallengeAuthenticatorOktaVerifyPushOnlyView
} from './ChallengeAuthenticatorDataOktaVerifyPushOnlyView';
import { Body as ChallengeAuthenticatorOktaVerifyView } from './ChallengeAuthenticatorDataOktaVerifyView';

export default BaseAuthenticatorView.extend({
  initialize() {
    BaseAuthenticatorView.prototype.initialize.apply(this, arguments);
    if (this.isPushOnlyFlow()) {
      this.Body = ChallengeAuthenticatorOktaVerifyPushOnlyView;
    } else {
      this.Body = ChallengeAuthenticatorOktaVerifyView;
    }
  },

  isPushOnlyFlow() {
    const uiSchema = this.options.currentViewState.uiSchema;
    const methodType = Array.isArray(uiSchema) && uiSchema.find(schema => schema.name === 'authenticator.methodType');
    const methodTypeOptions = methodType && methodType.options;
    return Array.isArray(methodTypeOptions) && methodTypeOptions.length === 1 && methodTypeOptions[0].value === 'push';
  },
});
