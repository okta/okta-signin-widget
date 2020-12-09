import { Selector } from 'testcafe';
import BasePageObject from './BasePageObject';

export default class PollingPageObject extends BasePageObject {

  constructor (t) {
    super(t);
    this.spinner = new Selector('.okta-waiting-spinner');
  }

  getHeader() {
    return this.form.getTitle();
  }

  hasSpinner() {
    return !!this.spinner;
  }
}