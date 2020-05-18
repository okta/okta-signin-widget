import email from '../shared/email';
import BaseFactorTerminalView from '../shared/BaseFactorTerminalView';
import { loc } from 'okta';

const Body = BaseFactorTerminalView.prototype.Body.extend(Object.assign(
  {
    subtitle () {
      return loc('email.link.terminal.msg', 'login');
    }
  },
  email,
));

export default BaseFactorTerminalView.extend({
  Body,
});
