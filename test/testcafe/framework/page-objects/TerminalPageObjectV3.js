import { Selector } from 'testcafe';
import TerminalPageObject from './TerminalPageObject';

const CANCEL_LINK = '[data-se="cancel"]';

export default class TerminalPageObjectV3 extends TerminalPageObject {

  async signoutLinkExists() {
    const cancelElement = await Selector(CANCEL_LINK);
    return cancelElement.exists;
  }

  async goBackLinkExists() {
    const cancelElement = await Selector(CANCEL_LINK);
    return cancelElement.exists;
  }
}
