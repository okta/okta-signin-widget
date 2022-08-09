import { Selector } from 'testcafe';

import EnrollPasswordPageObject from './FactorEnrollPasswordPageObject';

const SWITCH_AUTHENTICATOR_LINK = '[data-se="switchAuthenticator"]';

export default class FactorEnrollPasswordPageObjectV3 extends EnrollPasswordPageObject {
  constructor(t) {
    super(t);
  }

  async clickSwitchAuthenticatorButton() {
    await this.t.click(Selector(SWITCH_AUTHENTICATOR_LINK));
  }
}
