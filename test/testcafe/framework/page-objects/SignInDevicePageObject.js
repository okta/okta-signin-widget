import { Selector } from 'testcafe';
import BasePageObject from './BasePageObject';

export default class SignInDeviceViewPageObject extends BasePageObject {
  constructor(t) {
    super(t);
    this.t = t;
    this.beacon = new Selector('.beacon-container');
    this.body = new Selector('.launch-authenticator');
    this.footer = new Selector('.auth-footer');
  }

  getBeaconClass() {
    return this.beacon.find('[data-se="factor-beacon"]').getAttribute('class');
  }

  getHeader() {
    return this.body.find('[data-se="o-form-head"]').innerText;
  }

  getContentText() {
    return this.getTextContent('[data-se="o-form-fieldset-container"] .signin-with-ov-description');
  }

  getOVButtonIcon() {
    return this.body.find('.okta-verify-container [data-se="button"] span').getAttribute('class');
  }

  getOVButtonLabel() {
    return this.getTextContent('.okta-verify-container [data-se="button"]');
  }

  getEnrollFooterLinkText() {
    return this.footer.find('[data-se="enroll"]').innerText;
  }

  async clickLaunchOktaVerifyButton() {
    await this.t.click(this.body.find('.okta-verify-container [data-se="button"]'));
  }
}
