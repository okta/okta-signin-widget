import { loc } from 'okta';
import BaseView from '../internals//BaseView';
import BaseForm from '../internals//BaseForm';
import { validateFieldsMatch } from '../../util/ValidationUtil';

const EnrollFactorPasswordForm = BaseForm.extend({
  title: loc('factor.password', 'login'),
  save: loc('mfa.challenge.verify', 'login')
});

export default BaseView.extend({
  Body: EnrollFactorPasswordForm,

  createModelClass () {
    const ModelClass = BaseView.prototype.createModelClass.apply(this, arguments);
    return ModelClass.extend({

      validate: function (data) {
        return validateFieldsMatch(data.password, data.confirmPassword);
      }

    });
  }
});
