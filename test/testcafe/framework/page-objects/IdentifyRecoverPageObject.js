import BasePageObject from './BasePageObject';

export default class IdentifyRecoveryPageObject extends BasePageObject {
  constructor(t) {
    super(t);
    this.url = '/signin/forgot-password';
  }

  getIdentifyFieldLabel() {
    return this.form.getFormFieldLabel('identifier');
  }

}
