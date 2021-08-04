import { Selector } from 'testcafe';
import BasePageObject from './BasePageObject';

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

  getContent() {
    return this.getTextContent('[data-se="o-form-fieldset-container"]');
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

  async clickUniversalLink() {
    await this.t.click(Selector('.ul-button'));
  }

  async clickAppLink() {
    await this.t.click(Selector('.al-button'));
  }

  async clickLaunchOktaVerifyLink() {
    await this.t.click(this.body.find('#launch-ov'));
  }
}
