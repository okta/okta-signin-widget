import BaseFormObject from './components/BaseFormObject';
import { Selector, ClientFunction, userVariables } from 'testcafe';

const SIGNOUT_LINK = '.auth-footer .js-cancel';
const GO_BACK_LINK = '.auth-footer .js-go-back';
const SWITCH_AUTHENTICATOR_LINK = '[data-se="switchAuthenticator"]';
const ionMessagesSelector = '.ion-messages-container';
const SUBTITLE_SELECTOR = '[data-se="o-form-explain"]';
const FACTOR_PAGE_HELP_LINK = '[data-se="factorPageHelpLink"]';
const HELP_LINK_SELECTOR = '.auth-footer .js-help';

export default class BasePageObject {
  constructor(t) {
    this.t = t;
    this.url = '';
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
  }

  async preventRedirect(toUrls) {
    await ClientFunction((toUrls) => {
      window.addEventListener('submit', function(e) {
        if (!toUrls || toUrls.includes(e.target.action)) {
          e.preventDefault();
          return;
        }
        console.log('WARNING! allowing redirect:', e.target.action);
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

  getIdentifierTitle() {
    if (userVariables.gen3) {
      return Selector('[data-se="identifier-container"]').getAttribute('title');
    }
    return Selector('[data-se="identifier"]').getAttribute('title');
  }

  identifierHasContenteditable() {
    if (userVariables.gen3) {
      return Selector('[data-se="identifier"] > span').hasAttribute('contenteditable');
    }
    return Selector('[data-se="identifier"]').hasAttribute('contenteditable');
  }

  getFormFieldLabel(field) {
    return this.form.getFormFieldLabel(field);
  }

  getSaveButtonLabel() {
    return this.form.getSaveButtonLabel();
  }

  getFormSubtitle() {
    return this.form.getSubtitle();
  }

  getTextContent(selector) {
    return Selector(selector).innerText;
  }

  getIonMessages() {
    if (userVariables.gen3) {
      return this.getFormSubtitle(); 
    }
    return this.form.getElement(ionMessagesSelector).innerText;
  }

  // in v3 all Cancel links use the same wording
  getCancelLink() {
    return this.form.getLink('Back to sign in');
  }

  getHelpLink() {
    if (userVariables.gen3) {
      return this.form.getLink('Help');
    }
    return Selector(HELP_LINK_SELECTOR);
  }

  getForgotPasswordLink() {
    return Selector('[data-se="forgot-password"]');
  }

  async clickForgotPasswordLink() {
    await this.t.click(this.getForgotPasswordLink());
  }
  
  // in v2 the Cancel Link covers multiple links like 'Go Back' and 'Sign out'
  // in v3 all Cancel links use the same wording
  async signoutLinkExists() {
    if(userVariables.gen3){
      return this.getCancelLink().exists;
    }
    const elCount = await Selector(SIGNOUT_LINK).count;
    return elCount === 1;
  }

  async forgotPasswordLinkExists() {
    return this.getForgotPasswordLink().exists;
  }

  async helpLinkExists() {
    return this.getHelpLink().exists;
  }

  // in v2 the Cancel Link covers multiple links like 'Go Back' and 'Sign out'
  // in v3 all Cancel links use the same wording
  getSignoutLinkText() {
    return this.getCancelLink().textContent;
  }

  // in v2 the Cancel Link covers multiple links like 'Go Back' and 'Sign out'
  // in v3 all Cancel links use the same wording
  async clickSignOutLink() {
    await this.t.click(this.getCancelLink());
  }

  // in v2 the Cancel Link covers multiple links like 'Go Back' and 'Sign out'
  // in v3 all Cancel links use the same wording
  async goBackLinkExists() {
    if(userVariables.gen3) {
      return this.getCancelLink().exists;
    }
    const elCount = await Selector(GO_BACK_LINK).count;
    return elCount === 1;
  }

  // in v2 the Cancel Link covers multiple links like 'Go Back' and 'Sign out'
  // in v3 all Cancel links use the same wording
  getGoBackLinkText() {
    return this.getCancelLink().textContent;
  }

  // in v2 the Cancel Link covers multiple links like 'Go Back' and 'Sign out'
  // in v3 all Cancel links use the same wording
  async clickGoBackLink() {
    await this.t.click(this.getCancelLink());
  }

  /**
   * @deprecated
   */
  getSkipLinkText() {
    const SKIP_LINK = '.auth-footer .js-skip';

    return Selector(SKIP_LINK).textContent;
  }

  getSkipSetUpLink() {
    return this.form.getLink('Skip set up');
  }

  async clickSetUpSkipLink() {
    await this.t.click(await this.getSkipSetUpLink());
  }

  getErrorBoxText() {
    return this.form.getErrorBoxText();
  }

  getReturnToAuthenticatorListLink() {
    return this.form.getLink('Return to authenticator list');
  }

  getVerifyWithSomethingElseLink() {
    return this.form.getLink('Verify with something else');
  }

  async clickVerifyWithSomethingElseLink() {
    return await this.t.click(await this.getVerifyWithSomethingElseLink());
  }

  async clickReturnToAuthenticatorListLink() {
    return await this.t.click(await this.getReturnToAuthenticatorListLink());
  }

  getSwitchAuthenticatorLinkText() {  
    return Selector(SWITCH_AUTHENTICATOR_LINK).textContent;
  }

  async verifyWithSomethingElseLinkExists() {
    return await this.getVerifyWithSomethingElseLink().exists;
  }

  async returnToAuthenticatorListLinkExists() {
    return await this.getReturnToAuthenticatorListLink().exists;
  }

  /**
   * @deprecated
   * @see verifyWithSomethingElseLinkExists
   * @see returnToAuthenticatorListLinkExists
   * Depending on the test (Challenge vs Enroll) use one of the new functions
   * to check if the switch authenticator link exists
   */
  async switchAuthenticatorLinkExists() {
    const elCount = await Selector(SWITCH_AUTHENTICATOR_LINK).count;
    return elCount === 1;
  }

  getBeaconSelector() {
    if (userVariables.gen3) {
      return Selector('[data-se~="factor-beacon"]').getAttribute('data-se');
    }
    return Selector('[data-se="factor-beacon"]').getAttribute('class');
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

  hasText(text) {
    return this.form.getByText(text).exists;
  }

  formExists() {
    return Selector('form').exists;
  }

  spinnerExists() {
    if(userVariables.gen3) {
      return this.form.getSpinner().exists;
    }

    return Selector('.spinner').exists;
  }

  loadingBeaconExists() {
    if(userVariables.gen3) {
      return this.form.getSpinner().exists;
    }

    return Selector('.beacon-loading').exists;
  }

  getSpinnerStyle() {
    return Selector('.spinner').getStyleProperty('display');
  }

  isVisible() {
    return this.form.el.visible;
  }

  async getAriaDescription(el) {
    // If value of `aria-describedby` is a list of ids, the resulted accessible description
    //  is a concatenation of accessible names of corresponding elements joined with space.
    // Value of `aria-label` overrides text content when computing accessible name.
    //
    // https://www.w3.org/TR/accname-1.1/#mapping_additional_nd_description
    // https://www.w3.org/TR/html-aapi/#accessible-name-and-description-calculation
    // https://www.w3.org/TR/WCAG20-TECHS/aria#ARIA9

    const ariaDescription = await el.getAttribute('aria-description');
    const ariaDescribedByIds = await el.getAttribute('aria-describedby');
    const ariaDescribedByTexts = ariaDescribedByIds ? await Promise.all(
      ariaDescribedByIds?.split(' ')
        .map(sel => Selector('#'+sel))
        .map(async el => await el.getAttribute('aria-label') || await el.innerText)
    ) : [];
    return ariaDescription || ariaDescribedByTexts.join(' ');
  }
}
