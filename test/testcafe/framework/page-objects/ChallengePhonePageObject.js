import { userVariables } from 'testcafe';
import ChallengeFactorPageObject from './ChallengeFactorPageObject';

const RESEND_VIEW_SELECTOR = '.phone-authenticator-challenge__resend-warning';

export default class ChallengePhonePageObject extends ChallengeFactorPageObject {
  constructor(t) {
    super(t);
  }

  elementExists(selector) {
    return this.form.elementExist(selector);
  }

  clickSecondaryLink(name) {
    if (userVariables.gen3) {
      return this.form.clickButton(name);
    }
    return this.form.clickElement('.phone-authenticator-challenge__link');
  }

  resendCodeText(index) {
    if (userVariables.gen3) {
      if (index === undefined) {
        index = 0;
      }
      return this.form.getErrorBoxTextByIndex(index);
    }
    return this.form.getElement(RESEND_VIEW_SELECTOR).innerText;
  }

  getSecondaryLinkText(name) {
    if (userVariables.gen3) {
      return this.form.getButton(name).textContent;
    }
    return this.getTextContent('.phone-authenticator-challenge__link');
  }

  async resendCodeExists(index) {
    if (userVariables.gen3) {
      if (index === undefined) {
        index = 0;
      }
      return this.form.hasAlertBox(index);
    }

    const isHidden = await this.form.getElement(RESEND_VIEW_SELECTOR).hasClass('hide');
    return !isHidden;
  }

  subtitleContainsNoWrapElement() {
    return this.elementExists('[data-se="o-form-explain"] > span.nowrap');
  }
}