import BasePageObject from '../page-objects/BasePageObject';

export default class PrimaryAuthPageObject extends BasePageObject {
  constructor(t) {
    super(t);
  }

  getInputField(fieldName) {
    return this.form.findFormFieldInput(fieldName).child('input');
  }

  setUsername(username) {
    return this.form.setTextBoxValue('username', username);
  }

  async clickNextButton() {
    await this.form.clickSaveButton();
  }

  async clickLinkElement(name) {
    await this.t.click(this.form.getLink(name));
  }
}
