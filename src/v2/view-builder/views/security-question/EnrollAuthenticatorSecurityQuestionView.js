import { loc } from 'okta';
import BaseForm from '../../internals/BaseForm';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';

const Body = BaseForm.extend({
  title () {
    return loc('oie.security.question.enroll.title', 'login');
  },
  save () {
    return loc('oie.verify.button', 'login');
  },
});

export default BaseAuthenticatorView.extend({
  Body,
});
