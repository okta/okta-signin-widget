import BaseFactorView from './BaseFactorView';
import TerminalView from '../TerminalView';

export default BaseFactorView.extend({
  Body: TerminalView.prototype.Body,
  Footer: TerminalView.prototype.Footer,
});
