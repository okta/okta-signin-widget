import BaseFactorView from './BaseFactorView';
import {Footer as TerminalFooter, Body as TerminalBody } from '../TerminalView';

export default BaseFactorView.extend({
  Body: TerminalBody,
  Footer: TerminalFooter,
});
