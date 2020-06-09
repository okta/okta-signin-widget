import BaseView from '../internals/BaseView';
import BaseForm from '../internals/BaseForm';

import { loc } from 'okta';

const Body = BaseForm.extend({
  title: function () {
    return loc('oie.select.authenticators.enroll.title', 'login');
  },
  subtitle: function () {
    return loc('oie.select.authenticators.enroll.subtitle', 'login');
  },
  noButtonBar: true,
});

export default BaseView.extend({
  Body,
});

