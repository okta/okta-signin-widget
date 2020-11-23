import { Selector } from 'testcafe';
import BasePageObject from './BasePageObject';
import CalloutObject from './components/CalloutObject';

export default class TerminalPageObject extends BasePageObject {

  constructor () {
    this.beacon = new Selector('.beacon-container');
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

  getBeaconClass() {
    return this.beacon.find('[data-se="factor-beacon"]').getAttribute('class');
  }
}
