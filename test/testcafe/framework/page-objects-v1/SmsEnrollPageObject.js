import BasePageObject from '../page-objects/BasePageObject';
import { within } from '@testing-library/testcafe';

export default class SmsEnrollPageObject extends BasePageObject {
  constructor(t) {
    super(t);
  }

  hasMFAFactorsList() {
    return within(this.form.el).findAllByRole('list').nth(0).exists;
  }

  getPageSubtitle() {
    return this.form.getElement('.okta-form-subtitle').textContent;
  }
}
