import TerminalView from '../TerminalView';

const Body = TerminalView.prototype.Body.extend({
  title () {
    return 'You can close this window';
  },
});

export default TerminalView.extend({
  Body,
});
