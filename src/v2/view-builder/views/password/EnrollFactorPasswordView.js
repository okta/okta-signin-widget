import { loc } from 'okta';
import BaseView from '../../internals/BaseView';
import BaseForm from '../../internals/BaseForm';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';

const Body = BaseForm.extend({
  title: function () {
    return loc('enroll.password.setup', 'login');
  },
  save: function () {
    return loc('save.password', 'login');
  },

  getUISchema () {
    const uiSchemas = BaseForm.prototype.getUISchema.apply(this, arguments);
    return uiSchemas.concat([
      {
        name: 'confirmPassword',
        label: loc('password.confirmPassword.placeholder','login'),
        type: 'password',
        'label-top': true,
        params: {
          showPasswordToggle: true
        }
      }
    ]);
  }
});

export default BaseAuthenticatorView.extend({

  Body,

  createModelClass () {
    const ModelClass = BaseView.prototype.createModelClass.apply(this, arguments);
    const local = Object.assign(
      {
        confirmPassword: {
          type: 'string',
          required: true,
        }
      },
      ModelClass.prototype.local,
    );
    return ModelClass.extend({
      local,
      validate: function () {
        if (this.get('credentials.passcode') !== this.get('confirmPassword') &&
          this.get('credential.value') !== this.get('confirmPassword')) {

          var ret = {};
          ret['confirmPassword'] = loc('password.error.match', 'login');
          return ret;
        }
      }

    });
  }
});
