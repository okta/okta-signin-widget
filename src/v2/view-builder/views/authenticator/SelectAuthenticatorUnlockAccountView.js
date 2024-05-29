import { BaseForm, BaseView } from '../../internals';
import { loc } from '@okta/courage';

const Body = BaseForm.extend({
  noButtonBar: true,
  title: function() {
    return loc('oie.select.authenticators.verify.title', 'login');
  },
  subtitle: function() {
    return loc('oie.select.authenticators.verify.subtitle', 'login');
  },
});

export default BaseView.extend({
  Body
});