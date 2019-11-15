import { Selector } from 'testcafe';
import BasePageObject from './BasePageObject';
import BaseFormObject from './components/BaseFormObject';

export default class FactorRequiredPageObject extends BasePageObject {
  constructor(t) {
    super(t);
    this.form = new BaseFormObject(t);
  }

  verifyFactor(name, value) {
    return this.form.setTextBoxValue(name, value);
  }

  clickNextButton() {
    return this.form.clickSaveButton();
  }

  getPageTitle() {
    return this.form.getElement('.okta-form-title').textContent;
  }

  getPageSubTitle(selector) {
    return this.form.getElement(selector).textContent;
  }

  waitForErrorBox() {
    return this.form.waitForErrorBox();
  }

  getInvalidOTPError() {
    return this.form.getErrorBoxText();
  }
}
