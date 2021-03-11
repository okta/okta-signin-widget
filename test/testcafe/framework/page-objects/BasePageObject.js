import BaseFormObject from './components/BaseFormObject';
// import { getCSPTrap } from '../shared/csp-trap';
import { Selector } from 'testcafe';
import { checkConsoleMessages } from '../shared';
import { ClientFunction } from 'testcafe';

const SIGNOUT_LINK = '.auth-footer .js-cancel';
const GO_BACK_LINK = '.auth-footer .js-go-back';
const SKIP_LINK = '.auth-footer .js-skip';
const SKIP_SET_UP_LINK = '.auth-footer .js-skip-setup';
const SWITCH_AUTHENTICATOR_LINK = '.auth-footer .js-switchAuthenticator';
const ionMessagesSelector = '.ion-messages-container';

// TEMP: Keeping local to eliminate babel as source of problems https://devexpress.github.io/testcafe/documentation/guides/basic-guides/obtain-client-side-info.html#import-functions-to-be-used-as-client-function-dependencies
// const getCSPTrap = ClientFunction( () => { 
//   return window.globalCSPTrap;
// });

export default class BasePageObject {
  constructor(t) {
    this.t = t;
    this.url = '';
    this.form = new BaseFormObject(t);
  }

  async navigateToPage() {
    await this.t.navigateTo(`http://localhost:3000${this.url}`);
    await checkConsoleMessages(); // TEMP - ensuring everything is loaded
    await this.checkCSPTrap();
  }

  async checkCSPTrap() { 
    // const cspTrap = await getCSPTrap();
    const cspTrap = await this.t.eval( () => window.globalCSPTrap );
    if( !cspTrap ) { 
      throw new Error('failed to find CSPTrap');
    }
    throw new Error(cspTrap.length); // TEMP just verifying we see anything
    if( cspTrap.length ) { 
      const cspSummary = cspTrap.map( event => `${event.blockedURI} blocked due to ${event.effectiveDirective}`).join('\n');
      throw new Error(`${cspTrap.length} CSP Violation found: ${cspSummary}`);
    }
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
