import { userVariables } from 'testcafe';
import BasePageObject from './BasePageObject';

export default class EnrollCustomPasswordPageObject extends BasePageObject {
  constructor(t) {
    super(t);
  }

  async clickRedirectButton() {
    await this.t.click(this.getRedirectButton());
  }

  getRedirectButton() {
    if(userVariables.gen3) {
      return this.form.getButton('Go to Password reset website name');
    }

    return this.form.getLink('Go to Password reset website name');
  }

  getSkipLink() {
    return this.form.getLink('Remind me later');
  }
}
