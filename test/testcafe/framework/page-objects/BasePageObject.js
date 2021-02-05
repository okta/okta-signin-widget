import BaseFormObject from './components/BaseFormObject';
import { Selector } from 'testcafe';

const SIGNOUT_LINK = '.auth-footer .js-cancel';
const GO_BACK_LINK = '.auth-footer .js-go-back';
const SKIP_LINK = '.auth-footer .js-skip';
const SKIP_SET_UP_LINK = '.auth-footer .js-skip-setup';
const SWITCH_AUTHENTICATOR_LINK = '.auth-footer .js-switchAuthenticator';
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

  getIonMessages () {
    return this.form.getElement(ionMessagesSelector).innerText;
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

  async clickGoBackLink() {
    await this.t.click(Selector(GO_BACK_LINK));
  }

  async clickSignOutLink() {
    await this.t.click(Selector(SIGNOUT_LINK));
  }

  async skipLinkExists() {
    const elCount = await Selector(SKIP_LINK).count;
    return elCount === 1;
  }

  getSkipLinkText() {
    return Selector(SKIP_LINK).textContent;
  }

  async skipSetUpLinkExists() {
    const elCount = await Selector(SKIP_SET_UP_LINK).count;
    return elCount === 1;
  }

  getSetUpSkipLinkText() {
    return Selector(SKIP_SET_UP_LINK).textContent;
  }

  async clickSetUpSkipLink() {
    await this.t.click(Selector(SKIP_SET_UP_LINK));
  }

  async clickSwitchAuthenticatorButton() {
    await this.t.click(Selector(SWITCH_AUTHENTICATOR_LINK));
  }

  getSwitchAuthenticatorLinkText() {
    return Selector(SWITCH_AUTHENTICATOR_LINK).textContent;
  }

  async switchAuthenticatorLinkExists() {
    const elCount = await Selector(SWITCH_AUTHENTICATOR_LINK).count;
    return elCount === 1;
  }
}
