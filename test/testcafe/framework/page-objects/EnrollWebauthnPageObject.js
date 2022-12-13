import BasePageObject from './BasePageObject';
import { userVariables } from 'testcafe';

export default class EnrollWebauthnPageObject extends BasePageObject {
  constructor(t) {
    super(t);
  }

  hasEnrollInstruction() {
    return this.form.elementExist('.idx-webauthn-enroll-text');
  }

  getWebauthnNotSupportedError() {
    if (userVariables.v3) {
      return this.form.getSubtitle();
    }
    return this.form.el.find('.webauthn-not-supported').innerText;
  }
}
