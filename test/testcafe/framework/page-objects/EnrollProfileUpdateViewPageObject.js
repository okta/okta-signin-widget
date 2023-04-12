import { userVariables } from 'testcafe';
import BasePageObject from './BasePageObject';

export default class EnrollProfileUpdateViewPageObject extends BasePageObject {
  constructor(t) {
    super(t);
  }

  clickFinishButton() {
    return this.form.clickSaveButton('Finish');
  }

  getTextBoxErrorMessage(fieldName) {
    return this.form.getTextBoxErrorMessage(fieldName);
  }

  getFormFieldSubLabel(fieldName) {
    if (userVariables.v3) {
      return this.form.getElement(`label[for="${fieldName}"] > p`).innerText;
    }
    return this.form.getFormFieldSubLabel(fieldName);
  }

  skipProfileLinkExists() {
    return this.form.getLink('Skip Profile').exists;
  }

  async clickSkipProfileLink() {
    await this.t.click(this.form.getLink('Skip Profile'));
  }

  formFieldExistsByLabel(label) {
    return this.form.getByLabelText(label).exists;
  }
}
