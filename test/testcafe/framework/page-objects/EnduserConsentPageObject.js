import ConsentPageObject from './ConsentPageObject';
import { userVariables } from 'testcafe';

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

  getInfoItemTextBrowser() {
    if(userVariables.gen3) {
      return this.form.getElement('[data-se="text-browser"]').innerText;
    }
    return this.form.getInnerTexts('.enduser-email-consent--info');
  }

  getInfoItemTextAppName() {
    if(userVariables.gen3) {
      return this.form.getElement('[data-se="text-appName"]').innerText;
    }
    return this.form.getInnerTexts('.enduser-email-consent--info');
  }

  getCancelButtonLabel() {
    if (userVariables.gen3) {
      return this.form.getElement('[data-type="cancel"]').innerText; 
    }
    return this.form.getElement('input[data-type="cancel"]').value;
  }
}
