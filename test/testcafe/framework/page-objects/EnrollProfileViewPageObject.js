import BasePageObject from './BasePageObject';

export default class EnrollProfileViewPageObject extends BasePageObject {
  constructor(t) {
    super(t);
  }

  clickSubmitButton() {
    return this.form.clickSaveButton();
  }
}
