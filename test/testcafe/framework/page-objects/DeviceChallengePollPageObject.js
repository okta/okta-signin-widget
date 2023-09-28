import { Selector, userVariables } from 'testcafe';
import BasePageObject from './BasePageObject';

export default class DeviceChallengePollViewPageObject extends BasePageObject {
  constructor(t) {
    super(t);
    this.t = t;
    this.body = new Selector('.device-challenge-poll');
    this.footer = new Selector('.auth-footer');
  }

  getIframe() {
    return Selector('iframe');
  }

  getCustomUriIframeAttributes() {
    return this.getIframe().attributes;
  }

  getChromeDTCIframeAttributes() {
    return Selector('#chrome-dtc-container').attributes;
  }

  getContent() {
    if (userVariables.gen3) {
      return this.form.el.innerText;
    }
    return this.getTextContent('[data-se="o-form-fieldset-container"]');
  }

  hasAppLinkContent() {
    return this.form.getByText('If Okta Verify did not open automatically, tap Open Okta Verify.').exists;
  }

  getFooterLink() {
    return this.footer.find('[data-se="sign-in-options"]');
  }

  getFooterCancelPollingLink() {
    if (userVariables.gen3) {
      return this.getCancelLink();
    }
    return this.form.getLink('Cancel and take me to sign in');
  }

  getFooterSwitchAuthenticatorLink() {
    if (userVariables.gen3) {
      return this.getVerifyWithSomethingElseLink();
    }
    return this.footer.find('[data-se="switchAuthenticator"]');
  }

  getFooterSignOutLink() {
    if (userVariables.gen3) {
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
    if (userVariables.gen3) {
      return this.form.getSpinner().exists;
    }

    const display = await this.body.find('.spinner').getStyleProperty('display');

    return display === 'block';
  }

  getDownloadOktaVerifyLink() {
    return this.form.getLink('Download here').getAttribute('href');
  }

  getPrimaryButtonText() {
    if(userVariables.gen3) {
      return this.form.getButton('Open Okta Verify').innerText;
    }
    return this.form.getLink('Open Okta Verify').innerText;
  }

  waitForPrimaryButtonAfterSpinner() {
    if (userVariables.gen3) {
      return this.form.getButton('Open Okta Verify');
    }
    return Selector('[data-se="o-form-fieldset-container"] .button-primary', { timeout: 4500 });
  }

  async clickCancelAndGoBackLink() {
    if (userVariables.gen3) {
      await this.t.click(this.getFooterCancelPollingLink());
    } else {
      await this.t.click(Selector('a[data-se="cancel-authenticator-challenge"]'));
    }
  }

  async clickLaunchOktaVerifyButton() {
    if (userVariables.gen3) {
      await this.form.clickButton('Open Okta Verify');
    } else {
      await this.t.click(this.form.getLink('Open Okta Verify'));
    }
  }

  hasErrorBox() {
    return this.form.getErrorBox().exists;
  }
}
