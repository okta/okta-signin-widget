import { Selector } from 'testcafe';
import TerminalPageObject from './TerminalPageObject';

const BEACON_SELECTOR = '[data-se="factor-beacon"]';
const CANCEL_LINK = '[data-se="cancel"]';

export default class TerminalPageObjectV3 extends TerminalPageObject {

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
