import BasePageObject from './BasePageObject';
import { userVariables } from 'testcafe';

export default class EnrollWebauthnPageObject extends BasePageObject {
  constructor(t) {
    super(t);
  }

  hasEnrollInstruction() {
    if (userVariables.gen3) {
      return this.form.elementExist('[data-se="o-form-explain"]');
    }
    return this.form.elementExist('.idx-webauthn-enroll-text');
  }

  getWebauthnNotSupportedError() {
    if (userVariables.gen3) {
      return this.form.getErrorBoxText();
    }
    return this.form.el.find('.webauthn-not-supported').innerText;
  }
}
