import {Selector} from 'testcafe';
import BasePageObject from '../page-objects/BasePageObject';

export default class MfaChallengePageObject extends BasePageObject {
  constructor(t) {
    super(t);
  }

  getPageTitle() {
    return this.form.getElement('.okta-form-title').textContent;
  }

  getBeaconRect() {
    return Selector('.okta-sign-in-beacon-border').boundingClientRect;
  }

  getFormRect() {
    return Selector('.auth-content-inner').boundingClientRect;
  }
}
