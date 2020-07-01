import FactorEnrollPasswordPageObject from './FactorEnrollPasswordPageObject';

const requirementsSelector = '.password-authenticator__rules';

export default class AuthenticatorExpiredPasswordPageObject extends FactorEnrollPasswordPageObject {
  constructor (t) {
    super(t);
  }

  getRequirements () {
    return this.form.getElement(requirementsSelector).innerText;
  }
}
