import BasePageObject from './BasePageObject';
import CalloutObject from './components/CalloutObject';
import { userVariables } from 'testcafe';

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

  getMessages(index) {
    if (userVariables.v3) {
      return this.form.getSubtitle(index);
    }
    return this.form.getTerminalContent();
  }

  waitForErrorBox() {
    return this.form.waitForErrorBox();
  }

  doesTextExist(content) {
    return this.form.getByText(content).exists;
  }

  // Check for go back link unique to V2
  async goBackLinkExistsV2() {
    if(!userVariables.v3) {
      return this.goBackLinkExists();
    }
    return false;
  }
}
