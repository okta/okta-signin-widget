import ConsentPageObject from './ConsentPageObject';

export default class EnduserConsentPageObject extends ConsentPageObject {
  constructor(t) {
    super(t);
  }

  clickAllowButton() {
    return this.form.clickSaveButtonAsInput();
  }

  clickDontAllowButton() {
    return this.form.clickCancelButton();
  }

  getInfoItemTexts() {
    return this.form.getInnerTexts('.enduser-email-consent--info');
  }

  getSaveButtonLabel() {
    return this.form.getElement('input[type="submit"]').value;
  }

  getCancelButtonLabel() {
    return this.form.getElement('input[data-type="cancel"]').value;
  }
}
