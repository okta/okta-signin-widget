import { loc } from 'okta';
import BaseView from '../internals//BaseView';
import BaseForm from '../internals//BaseForm';

const Body = BaseForm.extend({
  title: function () {
    if (this.options.appState.get('isAuthenticateStep')) {
      return loc('mfa.factors.dropdown.title', 'login');
    } else {
      return loc('enroll.choices.title', 'login');
    }
  },
  noButtonBar: true,
});

export default BaseView.extend({
  Body,
});
