import { Selector } from 'testcafe';
import BasePageObject from './BasePageObject';
import BaseFormObject from './components/BaseFormObject';

export default class FactorRequiredPageObject extends BasePageObject {
  constructor(t) {
    super(t);
    this.form = new BaseFormObject(t);
  }

  verifyPassword(name, value) {
    return this.form.setTextBoxValue(name, value);
  }

  clickNextButton() {
    return this.form.clickSaveButton();
  }
}
