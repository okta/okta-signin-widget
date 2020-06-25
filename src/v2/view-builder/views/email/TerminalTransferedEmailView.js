import { loc } from 'okta';
import BaseAuthenticatorView from '../../components/BaseAuthenticatorView';
import TerminalView from '../TerminalView';

const Body = TerminalView.prototype.Body.extend({
  title () {
    return loc('closeWindow', 'login');
  },
});

export default BaseAuthenticatorView.extend({
  Body,
  Footer: TerminalView.prototype.Footer,
});
