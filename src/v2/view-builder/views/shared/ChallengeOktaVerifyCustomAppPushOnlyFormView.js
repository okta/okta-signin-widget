// Common view for OV push and custom app.
import { BaseForm } from '../../internals';
import {AUTHENTICATOR_KEY} from 'v2/ion/RemediationConstants';
import { loc } from '@okta/courage';


const Body = BaseForm.extend(Object.assign({
  className: function() {
    return this.isOV() ? 'okta-verify-send-push-form' : 'custom-app-send-push-form';
  },

  save() {
    return this.options.appState.get('authenticatorKey') === AUTHENTICATOR_KEY.OV ?
      loc('oie.okta_verify.sendPushButton', 'login'):
      loc('oie.custom_app.sendPushButton', 'login');
  },

  title() {
    return this.isOV() ? loc('oie.okta_verify.push.title', 'login'): loc('oie.custom_app.push.title', 'login');
  },

  render() {
    BaseForm.prototype.render.apply(this, arguments);
    // Move checkbox below the button
    // Checkbox is rendered by BaseForm using remediation response and 
    // hence by default always gets added above buttons.
    const checkbox = this.$el.find('[data-se="o-form-fieldset-authenticator.autoChallenge"]');
    checkbox.length && this.$el.find('.o-form-button-bar').after(checkbox);
  },

  getUISchema() {
    const uiSchemas = BaseForm.prototype.getUISchema.apply(this, arguments);
    return uiSchemas.filter(schema => schema.name !== 'authenticator.methodType');
  },

  isOV() {
    return this.options.appState.get('authenticatorKey') === AUTHENTICATOR_KEY.OV;
  },
}));

export default Body;
