import BasePageObject from './BasePageObject';
import BaseFormObject from './components/BaseFormObject';

export default class SelectFactorPageObject extends BasePageObject {
  constructor(t) {
    super(t);
    this.form = new BaseFormObject(t);
  }

  hasPasswordSelectButton() {
    return this.form.getSelectFormButton('.enroll-factor-row > .enroll-factor-description > .enroll-factor-button');
  }

  async selectPasswordFactor() {
    await this.form.clickElement('.enroll-factor-row > .enroll-factor-description > .enroll-factor-button');
  }
}
