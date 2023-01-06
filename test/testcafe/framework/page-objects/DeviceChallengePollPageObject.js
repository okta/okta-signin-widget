import { Selector, userVariables } from 'testcafe';
import BasePageObject from './BasePageObject';

const FORM_INFOBOX_ERROR = '[data-se="o-form-error-container"] [data-se="callout"]';

export default class DeviceChallengePollViewPageObject extends BasePageObject {
  constructor(t) {
    super(t);
    this.t = t;
    this.body = new Selector('.device-challenge-poll');
    this.footer = new Selector('.auth-footer');
  }

  /**
   * @deprecated use getFormTitle
   */
  getHeader() {
    return this.body.find('[data-se="o-form-head"]').innerText;
  }

  getIframeAttributes() {
    return Selector('iframe').attributes;
  }

  getContent() {
    return this.getTextContent('[data-se="o-form-fieldset-container"]');
  }

  getAppLinkContent() {
    return this.getTextContent('.appLinkContent');
  }

  getFooterLink() {
    return this.footer.find('[data-se="sign-in-options"]');
  }

  getFooterCancelPollingLink() {
    if (userVariables.v3) {
      return this.getCancelLink();
    }
    return this.form.getLink('Cancel and take me to sign in');
  }

  getFooterSwitchAuthenticatorLink() {
    return this.footer.find('[data-se="switchAuthenticator"]');
  }

  getFooterSignOutLink() {
    if (userVariables.v3) {
      return this.getCancelLink();
    }
    return this.footer.find('[data-se="cancel"]');
  }

  async clickCancelPollingButton() {
    await this.footer.click('[data-se="cancel-authenticator-challenge"]');
  }

  async clickSwitchAuthenticatorButton() {
    await this.t.click(this.getFooterSwitchAuthenticatorLink());
  }

  async hasSpinner() {
    if (userVariables.v3) {
      return this.form.getSpinner().exists;
    }

    const display = await this.body.find('.spinner').getStyleProperty('display');

    return display === 'block';
  }

  getDownloadOktaVerifyLink() {
    return this.form.getLink('Download here').getAttribute('href');
  }

  getPrimaryButtonText() {
    return this.body.find('[data-se="o-form-fieldset-container"] .button-primary').innerText;
  }

  waitForPrimaryButtonAfterSpinner() {
    return Selector('[data-se="o-form-fieldset-container"] .button-primary', { timeout: 4500 });
  }

  async clickCancelAndGoBackLink() {
    if (userVariables.v3) {
      await this.t.click(this.getCancelLink());
    } else {
      await this.t.click(Selector('a[data-se="cancel-authenticator-challenge"]'));
    }
  }

  async clickUniversalLink() {
    await this.t.click(Selector('.ul-button'));
  }

  async clickAppLink() {
    await this.t.click(Selector('.al-button'));
  }

  async clickLaunchOktaVerifyButton() {
    if (userVariables.v3) {
      await this.form.clickButton('Open Okta Verify');
    } else {
      await this.t.click(Selector('#launch-ov'));
    }
  }

  getErrorBox() {
    return this.form.getElement(FORM_INFOBOX_ERROR);
  }
}
