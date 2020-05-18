import { loc } from 'okta';
import BaseFactorTerminalView from '../shared/BaseFactorTerminalView';

const Body = BaseFactorTerminalView.prototype.Body.extend({
  title () {
    return loc('closeWindow', 'login');
  },
});

export default BaseFactorTerminalView.extend({
  Body,
});
