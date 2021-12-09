import { loc } from 'okta';
import { BaseForm } from '../../internals';

const Body = BaseForm.extend(Object.assign({
  className: 'okta-verify-send-push-form',

  save() {
    return loc('oie.okta_verify.sendPushButton', 'login');
  },

  title() {
    return loc('oie.okta_verify.push.title', 'login');
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
}));
  
export default Body;
