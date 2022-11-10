import { BaseForm, BaseView } from '../../internals';
import { loc } from '@okta/courage';

const Body = BaseForm.extend({

  title() {
    return loc('oie.activation.request.email.title.expire', 'login');
  },

  save() {
    return loc('oie.activation.request.email.button', 'login');
  },
});

export default BaseView.extend({
  Body
});