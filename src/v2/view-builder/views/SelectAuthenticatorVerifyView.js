import { BaseForm, BaseView } from '../internals';
import { loc } from 'okta';

export const Body = BaseForm.extend({
  title: function() {
    if (this.isPasswordRecoveryFlow())  {
      return loc('password.reset.title.generic', 'login');
    } else if (this.isPushOnlyFlow()) {
      return loc('oie.okta_verify.push.title', 'login');
    }
    return loc('oie.select.authenticators.verify.title', 'login');
  },
  subtitle: function() {
    if (this.isPasswordRecoveryFlow())  {
      return loc('oie.password.reset.verification', 'login');
    }
    return loc('oie.select.authenticators.verify.subtitle', 'login');
  },
  isPasswordRecoveryFlow() {
    return this.options.appState.get('isPasswordRecovery');
  },
  isPushOnlyFlow() {
    const uiSchema = this.options.currentViewState.uiSchema;
    const methodType = Array.isArray(uiSchema) && uiSchema.find(schema => schema.name === 'authenticator.methodType');
    const methodTypeOptions = methodType && methodType.options;
    return Array.isArray(methodTypeOptions) && methodTypeOptions.length === 1 && methodTypeOptions[0].value === 'push';
  },
  noButtonBar: true,
});

export default BaseView.extend({
  Body,
});
