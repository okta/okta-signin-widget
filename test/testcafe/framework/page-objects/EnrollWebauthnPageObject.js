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

  hasWebauthnNotSupportedError() {
    if (userVariables.gen3) {
      return this.form.hasErrorBox();
    }
    return this.form.elementExist('.webauthn-not-supported');
  }

  getWebauthnNotSupportedError() {
    if (userVariables.gen3) {
      return this.form.getErrorBoxText();
    }
    return this.form.el.find('.webauthn-not-supported').innerText;
  }

  setupButtonExists() {
    return this.form.getButton('Set up').exists;
  }
}
