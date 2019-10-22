import { loc } from 'okta';
import BaseView from '../../internals/BaseView';
import BaseForm from '../../internals/BaseForm';
import ValidationUtil from '../../../../util/ValidationUtil';
import BaseFactorView from '../shared/BaseFactorView';

const Body = BaseForm.extend({
  title: loc('factor.password', 'login'),
  save: loc('mfa.challenge.verify', 'login'),

  getUISchema () {
    const uiSchemas = BaseForm.prototype.getUISchema.apply(this, arguments);
    return uiSchemas.concat([
      {
        name: 'confirmPassword',
        label: 'Repeat Password',
        type: 'password',
        params: {
          showPasswordToggle: true
        }
      }
    ]);
  }
});

export default BaseFactorView.extend({

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
        return ValidationUtil.validateFieldsMatch(
          this,
          'credential.value',
          'confirmPassword',
          loc('password.error.match', 'login'),
        );
      }

    });
  }
});
