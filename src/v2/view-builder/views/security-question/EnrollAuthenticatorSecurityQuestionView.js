import { loc } from '@okta/courage';
import { BaseForm } from '../../internals';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';

const Body = BaseForm.extend({
  title() {
    return loc('oie.security.question.enroll.title', 'login');
  },
  save() {
    return loc('mfa.challenge.verify', 'login');
  },
});

export default BaseAuthenticatorView.extend({
  Body,
});
