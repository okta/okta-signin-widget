import { loc } from 'okta';
import email from '../shared/email';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';
import TerminalView from '../TerminalView';

const Body = TerminalView.prototype.Body.extend(Object.assign(
  {
    subtitle () {
      return loc('email.link.terminal.msg', 'login');
    }
  },
  email,
));

export default BaseAuthenticatorView.extend({
  Body,
  Footer: TerminalView.prototype.Footer,
});
