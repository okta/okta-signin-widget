import { Selector } from 'testcafe';
import BaseFormObjectV3 from './components/BaseFormObjectV3';
import TerminalPageObject from './TerminalPageObject';

const BEACON_SELECTOR = '[data-se="factor-beacon"]';
const CANCEL_LINK = '[data-se="cancel"]';

export default class TerminalPageObjectV3 extends TerminalPageObject {
  constructor(t) {
    super(t);
    // override super.form
    this.form = new BaseFormObjectV3(t);
  }

  getBeaconClass() {
    return Selector(BEACON_SELECTOR).getAttribute('class');
  }

  async signoutLinkExists() {
    const cancelElement = await Selector(CANCEL_LINK);
    return cancelElement.exists;
  }

  async goBackLinkExists() {
    const cancelElement = await Selector(CANCEL_LINK);
    return cancelElement.exists;
  }
}
