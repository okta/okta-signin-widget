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

  getRetryMessage() {
    return this.form.getByText(/We will automatically retry/);
  }

  getErrorMessages() {
    return new CalloutObject(this.form.el);
  }

  waitForErrorBox() {
    return this.form.waitForErrorBox();
  }

  hasSpinner() {
    return !!this.spinner;
  }
}