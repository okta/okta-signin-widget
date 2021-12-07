import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';
import { 
  Body as ChallengeAuthenticatorDataOktaVerifyPushOnlyView
} from './ChallengeAuthenticatorDataOktaVerifyPushOnlyView';
import { Body as ChallengeAuthenticatorDataOktaVerifyView } from './ChallengeAuthenticatorDataOktaVerifyView';

export default BaseAuthenticatorView.extend({
  initialize() {
    BaseAuthenticatorView.prototype.initialize.apply(this, arguments);
    if (this.isPushOnlyFlow()) {
      this.Body = ChallengeAuthenticatorDataOktaVerifyPushOnlyView;
    } else {
      this.Body = ChallengeAuthenticatorDataOktaVerifyView;
    }
  },

  isPushOnlyFlow() {
    const uiSchema = this.options?.currentViewState?.uiSchema;
    const methodType = Array.isArray(uiSchema) && uiSchema.find(schema => schema.name === 'authenticator.methodType');
    const methodTypeOptions = methodType?.options;
    return Array.isArray(methodTypeOptions) && methodTypeOptions.length === 1 && methodTypeOptions[0].value === 'push';
  },
});
