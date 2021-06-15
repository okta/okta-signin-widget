// import { Selector } from 'testcafe';
import BasePageObject from './BasePageObject';
import CalloutObject from './components/CalloutObject';

export default class RequestActivationEmailPageObject extends BasePageObject {

  constructor(t) {
    super(t);
  }

  getContent() {
    return this.form.getTerminalContent();
  }

  getErrorMessages() {
    return new CalloutObject(this.form.el);
  }

  clickRequestActivationEmailButton() {
    return this.form.clickSaveButton();
  }
}