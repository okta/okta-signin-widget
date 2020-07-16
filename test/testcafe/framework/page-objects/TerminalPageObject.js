import BasePageObject from './BasePageObject';
import CalloutObject from './components/CalloutObject';

export default class TerminalPageObject extends BasePageObject {

  getHeader() {
    return this.form.getTitle();
  }

  getErrorMessages() {
    return new CalloutObject(this.form.el);
  }

  getMessages() {
    return this.form.getTerminalContent();
  }

}
