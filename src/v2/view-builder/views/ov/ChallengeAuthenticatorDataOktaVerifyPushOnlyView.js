import { createButton, loc } from 'okta';
import { BaseForm } from '../../internals';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';

const Body = BaseForm.extend(Object.assign({
  initialize() {
    BaseForm.prototype.initialize.apply(this, arguments);
    this.addView();
  },

  title() {
    return loc('oie.okta_verify.push.title', 'login');
  },

  addView() {
    this.add(createButton({
      className: 'button button-wide button-primary send-push',
      title: loc('oie.okta_verify.sendPushButton', 'login'),
      click: () => {
        this.$el.submit();
      },
    }));
    this.add(
      `<span class='accessibility-text' role='alert'>${loc('oie.okta_verify.sendPushButton', 'login')}</span>`,
    );
  },

  render() {
    BaseForm.prototype.render.apply(this, arguments);
    this.$el.addClass('okta-verify-push-challenge');
    // Move checkbox below the button
    const checkbox = this.$el.find('.o-form-fieldset');
    checkbox.length && this.$el.find('.o-form-fieldset-container').append(checkbox);
  },

  getUISchema() {
    const uiSchemas = BaseForm.prototype.getUISchema.apply(this, arguments);
    return uiSchemas.filter(schema => schema.name !== 'authenticator.methodType');
  },
  noButtonBar: true,
}));

const AuthenticatorView = BaseAuthenticatorView.extend({
  Body,
});
  
export {
  AuthenticatorView as default,
  Body,
};
