import BasePageObject from './BasePageObject';
import { Selector, userVariables } from 'testcafe';
import { within } from '@testing-library/testcafe';

export default class IdPAuthenticatorPageObject extends BasePageObject {
  constructor(t) {
    super(t);
    this.beacon = Selector('[data-se~="factor-beacon"]');
  }

  getPageSubtitle() {
    return this.form.getSubtitle();
  }

  getErrorFromErrorBox() {
    return this.form.getErrorBoxText();
  }

  submit(name) {
    return this.form.clickSaveButton(name);
  }

  getBeaconBgImage() {
    if (userVariables.gen3) {
      return within(this.beacon).getByRole('img', {
        name: 'Redirect to a third party MFA provider to sign in.',
        hidden: true
      }).getAttribute('src');
    }
    return this.beacon.getStyleProperty('background-image');
  }

  getLinkElement(name) {
    return this.form.getLink(name);
  }
}
