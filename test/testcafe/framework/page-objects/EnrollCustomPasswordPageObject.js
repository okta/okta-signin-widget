import BasePageObject from './BasePageObject';

const REDIRECT_BUTTON = 'a.button.button-primary.button-wide';

export default class EnrollCustomPasswordPageObject extends BasePageObject {
  constructor(t) {
    super(t);
  }

  async clickRedirectButton() {
    await this.form.clickElement(REDIRECT_BUTTON);
  }

  getRedirectButtonLabel() {
    return this.getTextContent(REDIRECT_BUTTON);
  }
}
