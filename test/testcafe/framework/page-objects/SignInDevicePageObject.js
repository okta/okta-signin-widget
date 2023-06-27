import { Selector, userVariables } from 'testcafe';
import { within } from '@testing-library/testcafe';
import BasePageObject from './BasePageObject';

export default class SignInDeviceViewPageObject extends BasePageObject {
  constructor(t) {
    super(t);
    this.t = t;
    this.body = new Selector('.launch-authenticator');
    this.footer = new Selector('.auth-footer');
  }

  getHeader() {
    return this.body.find('[data-se="o-form-head"]').innerText;
  }

  getContentText() {
    return this.form.getByText('To access Microsoft Office 365, your organization requires you to sign in with Okta FastPass.');
  }

  getOVButtonIcon() {
    if (userVariables.v3) {
      return within(
        this.form.getButton('Okta Verify Sign in with Okta FastPass')
      ).queryByRole('img', { name: 'Okta Verify' });
    }
    return this.body.find('.okta-verify-container [data-se="button"] span.icon.okta-verify-authenticator');
  }

  getOVButtonLabel() {
    if (userVariables.v3) {
      return this.form.getButton('Okta Verify Sign in with Okta FastPass').innerText;
    }
    return this.getTextContent('.okta-verify-container [data-se="button"]');
  }

  getEnrollFooterLink() {
    return this.form.getLink('Sign up');
  }

  getUnlockAccountLink(name = 'Unlock account?') {
    return this.form.getLink(name);
  }

  unlockAccountLinkExists(name = 'Unlock account?') {
    return this.getUnlockAccountLink(name).exists;
  }

  getUnlockAccountLinkText() {
    return this.getUnlockAccountLink().textContent;
  }

  getCustomUnlockAccountLinkUrl(name) {
    return this.getUnlockAccountLink(name).getAttribute('href');
  }

  getSignOutFooterLink() {
    return this.getCancelLink();
  }

  async clickLaunchOktaVerifyButton() {
    if (userVariables.v3) {
      await this.form.clickButton('Okta Verify Sign in with Okta FastPass');
    } else {
      await this.t.click(this.body.find('.okta-verify-container [data-se="button"]'));
    }
  }
}
