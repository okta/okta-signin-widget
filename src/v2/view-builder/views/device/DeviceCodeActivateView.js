import { loc } from 'okta';
import { BaseForm, BaseView } from '../../internals';

const Body = BaseForm.extend({

  title() {
    return loc('oie.device.code.activated.title', 'login');
  },

  subtitle() {
    return loc('oie.device.code.activated.subtitle', 'login');
  },
});

export default BaseView.extend({
  Body
});
