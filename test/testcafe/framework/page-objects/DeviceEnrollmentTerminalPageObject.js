import { Selector, userVariables } from 'testcafe';
import BasePageObject from './BasePageObject';

const COPY_BUTTON_CLASS = '.copy-clipboard-button';
const COPY_ORG_LINK_BUTTON_CLASS = '.copy-org-clipboard-button';

export default class DeviceEnrollmentTerminalPageObject extends BasePageObject {
  constructor(t) {
    super(t);
    this.t = t;
    this.body = new Selector('.device-enrollment-terminal');
    this.footer = new Selector('.auth-footer');
  }

  async clickWithoutOVAccount() {
    await this.form.selectRadioButtonOption('hasOVAccount', 0);
  }

  async clickWithOVAccount() {
    await this.form.selectRadioButtonOption('hasOVAccount', 1);
  }

  async clickNextButton() {
    await this.form.clickSaveButton();
  }

  getBackLink() {
    return this.form.getLink('Back');
  }

  async clickBackLink() {
    await this.t.click(this.getBackLink());
  }

  getBackLinkText() {
    return this.getBackLink().innerText;
  }

  getSubHeader() {
    if (userVariables.v3) {
      return this.form.getSubtitle();
    }
    return this.getTextContent('[data-se="subheader"]');
  }

  getContentText() {
    if(userVariables.v3) {
      return this.getTextContent('[data-se="o-form"]');
    }
    return this.getTextContent('[data-se="o-form-fieldset-container"]');
  }

  getContentByIndex(idx = 1) {
    if (userVariables.v3) {
      return this.getTextContent(`ol li:nth-of-type(${idx})`);
    }
    return this.getTextContent(`.o-form-fieldset-container ol li:nth-of-type(${idx})`);
  }

  getAppStoreLink() {
    return this.body.find('[data-se="app-store"] a').getAttribute('href');
  }

  getAppStoreLogo() {
    return this.body.find('[data-se="app-store"] .app-store-logo').getAttribute('class');
  }

  getCopyButtonLabel() {
    if(userVariables.v3) {
      return this.form.getButton('Copy link to clipboard').innerText;
    }
    return this.getTextContent(COPY_BUTTON_CLASS);
  }

  getCopiedValue() {
    return this.body.find(COPY_BUTTON_CLASS).getAttribute('data-clipboard-text');
  }

  getCopyOrgLinkButtonLabel() {
    if(userVariables.v3) {
      return this.form.getButton('Copy sign-in URL to clipboard').innerText;
    }
    return this.getTextContent(COPY_ORG_LINK_BUTTON_CLASS);
  }

  getCopiedOrgLinkValue() {
    return this.body.find(COPY_ORG_LINK_BUTTON_CLASS).getAttribute('data-clipboard-text');
  }
}
