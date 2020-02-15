import BaseView from '../internals/BaseView';
import BaseForm from '../internals/BaseForm';
import { loc } from 'okta';

const Body = BaseForm.extend({
  title: function () {
    return loc('enroll.choices.setup', 'login');
  },
  subtitle: loc('enroll.choices.description', 'login'),
  noButtonBar: true,
});

export default BaseView.extend({
  Body,
});

