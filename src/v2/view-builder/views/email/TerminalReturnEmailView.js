import TerminalView from '../TerminalView';
import email from '../../shared/email';

const Body = TerminalView.prototype.Body.extend(Object.assign(
  {
    subtitle: 'To finish signing in, return to the screen where you requested the email link.',
  },
  email,
));

export default TerminalView.extend({
  Body,
});
