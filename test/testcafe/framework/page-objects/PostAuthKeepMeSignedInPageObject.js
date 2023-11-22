import { userVariables } from 'testcafe';
import BasePageObject from './BasePageObject';

const acceptButtonSelector = 'Stay signed in';
const rejectButtonSelector = 'Don\'t stay signed in';

export default class PostAuthKeepMeSignedInPageObject extends BasePageObject {
  constructor(t) {
    super(t);
  }

  getAcceptButtonText() {
    return this.getButtonText(acceptButtonSelector);
  }

  getRejectButtonText() {
    return this.getButtonText(rejectButtonSelector);
  }

  async clickAcceptButton() {
    await this.clickButton(acceptButtonSelector);
  }
  
  async clickRejectButton() {
    await this.clickButton(rejectButtonSelector);
  }

  getButtonText(buttonSelector) {
    let button;
    if (userVariables.gen3) {
      button = this.form.getButton(buttonSelector);
    } else {
      button = this.form.getLink(buttonSelector);
    }
    return button.innerText;
  }

  async clickButton(buttonSelector) {
    if (userVariables.gen3) {
      await this.form.clickButton(buttonSelector);
    } else {
      await this.t.click(this.form.getLink(buttonSelector));
    }
  }
}
