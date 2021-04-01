import BasePageObject from './BasePageObject';
import CalloutObject from './components/CalloutObject';

export default class TerminalPageObject extends BasePageObject {

  constructor(t) {
    super(t);
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
