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
    return this.form.getFormFieldSubLabel(fieldName);
  }

  finishButtonExists() {
    return this.form.getButton('Finish').exists;
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
