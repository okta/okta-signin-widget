import { Selector, userVariables } from 'testcafe';
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

  getContentText() {
    return this.form.getByText('To access Microsoft Office 365, your organization requires you to sign in with Okta FastPass.');
  }

  getOVButtonIcon() {
    if(userVariables.v3) {
      return this.form.getButtonIcon('Okta Verify Sign in with Okta FastPass').textContent;
    }
    return this.body.find('.okta-verify-container [data-se="button"] span').getAttribute('class');
  }

  getOVButtonLabel() {
    if(userVariables.v3) {
      return this.form.getButton('Okta Verify Sign in with Okta FastPass').innerText;
    }
    return this.getTextContent('.okta-verify-container [data-se="button"]');
  }

  getEnrollFooterLink() {
    return this.form.getLink('Sign up');
  }

  getHelpFooterLink() {
    return this.footer.find('[data-se="help"]');
  }

  getSignOutFooterLink() {
    return this.getCancelLink();
  }

  async clickLaunchOktaVerifyButton() {
    if(userVariables.v3) {
      await this.form.clickButton('Okta Verify Sign in with Okta FastPass');
    } else {
      await this.t.click(this.body.find('.okta-verify-container [data-se="button"]'));
    }
  }
}
