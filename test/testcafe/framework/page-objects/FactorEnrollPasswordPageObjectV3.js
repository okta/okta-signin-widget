import { Selector } from 'testcafe';

import EnrollPasswordPageObject from './FactorEnrollPasswordPageObject';

const SWITCH_AUTHENTICATOR_LINK = '[data-se="switchAuthenticator"]';

/**
 * This page object will be used by 
 * password enrollment
 * password expiry
 * password will expire soon 
 * admin initiated password reset scenarios.
 * 
 * TODO: Rename this to have AuthenticatorPasswordPageObject when Factor is cleaned up.
 */
export default class FactorEnrollPasswordPageObjectV3 extends EnrollPasswordPageObject {
  constructor(t) {
    super(t);
  }

  async clickSwitchAuthenticatorButton() {
    await this.t.click(Selector(SWITCH_AUTHENTICATOR_LINK));
  }
}
