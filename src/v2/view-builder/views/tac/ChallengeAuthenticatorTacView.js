import { loc } from '@okta/courage';
import { BaseForm } from '../../internals';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';

const Body = BaseForm.extend(Object.assign(
  {
    className: 'tac-authenticator-challenge',

    title() {
      return loc('oie.verify.tac.title', 'login');
    },

    subtitle() {
      return loc('oie.verify.tac.description', 'login');
    },

    save() {
      return loc('mfa.challenge.verify', 'login');
    },
  },
));

export default BaseAuthenticatorView.extend({
  Body,
});

