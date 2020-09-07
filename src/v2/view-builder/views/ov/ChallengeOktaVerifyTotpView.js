import { loc } from 'okta';
import BaseForm from '../../internals/BaseForm';

const Body = BaseForm.extend(Object.assign(
  {
    className: 'okta-verify-totp-challenge',

    title () {
      return loc('oie.okta_verify.totp.title', 'login');
    },

    save () {
      return loc('mfa.challenge.verify', 'login');
    },
  },
));

export default Body;
