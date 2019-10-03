import BaseFactorTerminalView from '../shared/BaseFactorTerminalView';

const Body = BaseFactorTerminalView.prototype.Body.extend({
  title () {
    return 'You can close this window';
  },
});

export default BaseFactorTerminalView.extend({
  Body,
});
