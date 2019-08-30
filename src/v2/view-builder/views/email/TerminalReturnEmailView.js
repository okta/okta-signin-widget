import email from '../shared/email';
import BaseFactorTerminalView from '../shared/BaseFactorTerminalView';

const Body = BaseFactorTerminalView.prototype.Body.extend(Object.assign(
  {
    subtitle: 'To finish signing in, return to the screen where you requested the email link.',
  },
  email,
));

export default BaseFactorTerminalView.extend({
  Body,
});
