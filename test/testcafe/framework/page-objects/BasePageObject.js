import BaseFormObject from './components/BaseFormObject';
import { Selector } from 'testcafe';

const SIGNOUT_LINK = '.auth-footer .js-cancel';
const GO_BACK_LINK = '.auth-footer .js-go-back';
const SKIP_LINK = '.auth-footer .js-skip';
const ionMessagesSelector = '.ion-messages-container';
export default class BasePageObject {
  constructor(t) {
    this.t = t;
    this.url = '';
    this.form = new BaseFormObject(t);
  }

  async navigateToPage() {
    await this.t.navigateTo(`http://localhost:3000${this.url}`);
  }

  getFormTitle() {
    return this.form.getTitle();
  }

  getSaveButtonLabel() {
    return this.form.getElement('.button-primary').value;
  }

  getFormSubtitle() {
    return this.form.getSubtitle();
  }

  getTextContent(selector) {
    return Selector(selector).innerText;
  }

  async signoutLinkExists() {
    const elCount = await Selector(SIGNOUT_LINK).count;
    return elCount === 1;
  }

  getSignoutLinkText() {
    return Selector(SIGNOUT_LINK).textContent;
  }

  async goBackLinkExists() {
    const elCount = await Selector(GO_BACK_LINK).count;
    return elCount === 1;
  }

  getGoBackLinkText() {
    return Selector(GO_BACK_LINK).textContent;
  }

  async skipLinkExists() {
    const elCount = await Selector(SKIP_LINK).count;
    return elCount === 1;
  }

  getSkipLinkText() {
    return Selector(SKIP_LINK).textContent;
  }

  getIonMessages () {
    return this.form.getElement(ionMessagesSelector).innerText;
  }
}
