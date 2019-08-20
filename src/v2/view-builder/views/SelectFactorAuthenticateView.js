import BaseView from '../internals/BaseView';
import BaseForm from '../internals/BaseForm';
import { loc } from 'okta';

const Body = BaseForm.extend({
  title: function () {
    return loc('mfa.factors.dropdown.title', 'login');
  },
  noButtonBar: true,
});

export default BaseView.extend({
  Body,
});

