import { Selector } from 'testcafe';
import BasePageObject from '../page-objects/BasePageObject';

export default class UnlockAccountPageObject extends BasePageObject {
  constructor(t) {
    super(t);
  }

  hasEmailOrUsernameField() {
    return this.form.fieldByLabelExists('Email or username');
  }

  isBeaconVisible() {
    return Selector('.beacon-container').visible;
  }

  isSecurityImageTooltipVisible() {
    return Selector('.okta-security-image-tooltip').visible;
  }
}
