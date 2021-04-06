import { Selector } from 'testcafe';
import BasePageObject from './BasePageObject';
import CalloutObject from './components/CalloutObject';

export default class PollingPageObject extends BasePageObject {

  constructor(t) {
    super(t);
    this.spinner = new Selector('.okta-waiting-spinner');
  }

  getHeader() {
    return this.form.getTitle();
  }

  getContent() {
    return this.form.getElement('.ion-messages-container');
  }

  getErrorMessages() {
    return new CalloutObject(this.form.el);
  }

  hasSpinner() {
    return !!this.spinner;
  }
}