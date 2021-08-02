import BasePageObject from './BasePageObject';
import CalloutObject from './components/CalloutObject';

const TERMINAL_VIEW = '.siw-main-view.terminal';
export default class TerminalPageObject extends BasePageObject {

  constructor(t) {
    super(t);
  }

  async waitForTerminalView() {
    await this.form.el.find(TERMINAL_VIEW).exists;
  }

  getHeader() {
    return this.form.getTitle();
  }

  getErrorMessages() {
    return new CalloutObject(this.form.el);
  }

  getMessages() {
    return this.form.getTerminalContent();
  }

  waitForErrorBox() {
    return this.form.waitForErrorBox();
  }
}
