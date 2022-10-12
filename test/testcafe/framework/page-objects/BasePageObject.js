import BaseFormObject from './components/BaseFormObject';
import { Selector, ClientFunction } from 'testcafe';

const SIGNOUT_LINK = '.auth-footer .js-cancel';
const GO_BACK_LINK = '.auth-footer .js-go-back';
const SKIP_LINK = '.auth-footer .js-skip';
const SKIP_SET_UP_LINK = '.auth-footer .js-skip-setup';
const SWITCH_AUTHENTICATOR_LINK = '.auth-footer .js-switchAuthenticator';
const ionMessagesSelector = '.ion-messages-container';
const SUBTITLE_SELECTOR = '[data-se="o-form-explain"]';
const FACTOR_PAGE_HELP_LINK = '[data-se="factorPageHelpLink"]';
const FORM_SELECTOR = 'form';

export default class BasePageObject {
  constructor(t) {
    this.t = t;
    this.url = '';
    this.beacon = new Selector('.beacon-container');
    this.form = new BaseFormObject(t);
  }

  async mockCrypto() {
    await ClientFunction(() => {
      if (typeof window.crypto === 'undefined') {
        window.crypto = {};
      }
    
      if (typeof window.crypto.subtle === 'undefined') {
        window.crypto.subtle = {
          digest: function() {
            return Promise.resolve(65);
          }
        };
      }
    
      if (typeof Uint8Array === 'undefined') {
        window['Uint8Array'] = window.Number;
      }
    
      String.fromCharCode = function() {
        return 'mocked';
      };
    })();
  }

  async navigateToPage(queryParams) {
    let qs = '';
    if (queryParams) {
      qs = Object.keys(queryParams).reduce((acc, cur) => {
        acc = acc ? acc + '&' : '?';
        return acc + encodeURIComponent(cur) + '=' + encodeURIComponent(queryParams[cur]);
      }, '');
    }
    await this.t.navigateTo(`http://localhost:3000${this.url}${qs}`);

    if (queryParams?.render !== false) {
      await this.t.expect(Selector(FORM_SELECTOR).exists).eql(true);
    }
  }

  async preventRedirect(toUrls) {
    await ClientFunction((toUrls) => {
      window.addEventListener('submit', function(e) {
        if (!toUrls || toUrls.includes(e.target.action)) {
          e.preventDefault();
        }
      });
    })(toUrls);
  }

  async getPageUrl() {
    const pageUrl = await ClientFunction(() => window.location.href)();
    return pageUrl;
  }

  getFormTitle() {
    return this.form.getTitle();
  }

  hasIdentifier() {
    return this.form.elementExist('[data-se="identifier"]');
  }

  getIdentifier() {
    return this.getTextContent('[data-se="identifier"]');
  }

  getFormFieldLabel(field) {
    return this.form.getFormFieldLabel(field);
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

  getIonMessages() {
    return this.form.getElement(ionMessagesSelector).innerText;
  }

  async signoutLinkExists() {
    const elCount = await Selector(SIGNOUT_LINK).count;
    return elCount === 1;
  }

  getSignoutLinkText() {
    return Selector(SIGNOUT_LINK).textContent;
  }

  async clickSignOutLink() {
    await this.t.click(Selector(SIGNOUT_LINK));
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

  async clickSkipLink() {
    await this.t.click(Selector(SKIP_LINK));
  }

  async skipSetUpLinkExists() {
    const elCount = await Selector(SKIP_SET_UP_LINK).count;
    return elCount === 1;
  }

  getSetUpSkipLinkText() {
    return Selector(SKIP_SET_UP_LINK).textContent;
  }

  getErrorBoxText() {
    return this.form.getErrorBoxText();
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

  getBeaconClass() {
    return this.beacon.find('[data-se="factor-beacon"]').getAttribute('class');
  }

  refresh() {
    return this.t.eval(() => location.reload(true));
  }

  subtitleExists() {
    return this.form.elementExist(SUBTITLE_SELECTOR);
  }

  getFactorPageHelpLink() {
    return Selector(FACTOR_PAGE_HELP_LINK).getAttribute('href');
  }

  getFactorPageHelpLinksLabel() {
    return Selector(FACTOR_PAGE_HELP_LINK).textContent;
  }

  async factorPageHelpLinksExists() {
    const elCount = await Selector(FACTOR_PAGE_HELP_LINK).count;

    return elCount === 1;
  }
}
