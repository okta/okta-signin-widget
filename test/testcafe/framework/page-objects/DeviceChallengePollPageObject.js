import { Selector } from 'testcafe';
import BasePageObject from './BasePageObject';

const FORM_INFOBOX_ERROR = '[data-se="o-form-error-container"] [data-se="callout"]';

export default class DeviceChallengePollViewPageObject extends BasePageObject {
  constructor(t) {
    super(t);
    this.t = t;
    this.beacon = new Selector('.beacon-container');
    this.body = new Selector('.device-challenge-poll');
    this.footer = new Selector('.auth-footer');
  }

  getBeaconClass() {
    return this.beacon.find('[data-se="factor-beacon"]').getAttribute('class');
  }

  getHeader() {
    return this.body.find('[data-se="o-form-head"]').innerText;
  }

  getIframeAttributes() {
    return Selector('#custom-uri-container').attributes;
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
    return this.footer.find('[data-se="cancel-authenticator-challenge"]');
  }

  getFooterSwitchAuthenticatorLink() {
    return this.footer.find('[data-se="switchAuthenticator"]');
  }

  getFooterSignOutLink() {
    return this.footer.find('[data-se="cancel"]');
  }

  async clickCancelPollingButton() {
    await this.footer.click('[data-se="cancel-authenticator-challenge"]');
  }

  async clickSwitchAuthenticatorButton() {
    await this.t.click(this.getFooterSwitchAuthenticatorLink());
  }

  getSpinner() {
    return this.body.find('.spinner');
  }

  getDownloadOktaVerifyLink() {
    return this.body.find('#download-ov').getAttribute('href');
  }

  getPrimiaryButtonText() {
    return this.body.find('[data-se="o-form-fieldset-container"] .button-primary').innerText;
  }

  waitForPrimaryButtonAfterSpinner() {
    return Selector('[data-se="o-form-fieldset-container"] .button-primary', { timeout: 4500 });
  }

  async clickUniversalLink() {
    await this.t.click(Selector('.ul-button'));
  }

  async clickAppLink() {
    await this.t.click(Selector('.al-button'));
  }

  async clickLaunchOktaVerifyLink() {
    await this.t.click(this.body.find('#launch-ov'));
  }

  getErrorBox() {
    return this.form.getElement(FORM_INFOBOX_ERROR);
  }
}
