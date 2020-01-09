import { Selector } from 'testcafe';
import BasePageObject from './BasePageObject';
import BaseFormObject from './components/BaseFormObject';

const CALLOUT_SELECTOR = '.infobox-warning > div';

export default class IdentityPageObject extends BasePageObject {
  constructor (t) {
    super(t);
    this.form = new BaseFormObject(t);
  }

  getPageTitle() {
    return this.form.getElement('.okta-form-title').textContent;
  }

  getOktaVerifyButtonText() {
    return this.form.getElement('.sign-in-with-device-option .okta-verify-container .link-button').textContent;
  }

  async clickOktaVerifyButton() {
    await this.t.click(Selector('.sign-in-with-device-option .okta-verify-container .link-button'));
  }

  getSeparationLineText() {
    return this.form.getElement('.sign-in-with-device-option .separation-line').textContent;
  }

  fillIdentifierField(value) {
    return this.form.setTextBoxValue('identifier', value);
  }

  getIdentifierValue() {
    return this.form.getTextBoxValue('identifier');
  }

  clickNextButton() {
    return this.form.clickSaveButton();
  }

  waitForErrorBox() {
    return this.form.waitForErrorBox();
  }

  waitForIdentifierError(){
    return this.form.waitForTextBoxError('identifier');
  }

  hasIdentifierError() {
    return this.form.hasTextBoxError('identifier');
  }

  hasIdentifierErrorMessage() {
    return this.form.hasTextBoxErrorMessage('identifier');
  }

  getUnknownUserCalloutContent() {
    return this.form.getCallout(CALLOUT_SELECTOR).textContent;
  }

  async clickRegistrationButton() {
    await this.t.click(Selector('a[data-se="enroll"]'));
  }
}
