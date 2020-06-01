import BasePageObject from './BasePageObject';

export default class EnrollPasswordPageObject extends BasePageObject {
  constructor (t) {
    super(t);
  }

  hasEnrollInstruction() {
    return this.form.elementExist('.idx-webauthn-enroll-text');
  }

  hasWebauthnNotSupportedError() {
    return this.form.elementExist('.webauthn-not-supported');
  }
}
