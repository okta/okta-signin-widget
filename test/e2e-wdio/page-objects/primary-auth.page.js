import { waitForLoad } from '../util/waitUtil';

class PrimaryAuthPage {
  get username() { return $('input[name="username"]'); }
  get password() { return $('input[name="password"]'); }
  get errorBox() { return $('.okta-form-infobox-error'); }
  get submit() { return $('[data-type="save"]'); }

  async login(username, password) {
    await this.username.setValue(username);
    await this.password.setValue(password);
    await this.submit.click();
  }

  async assertErrorMessage(errorMessage) {
    await waitForLoad(this.errorBox);
    await this.errorBox.then(el => el.getText()).then(txt => {
      expect(txt).toBe(errorMessage);
    });
  }
}

export default new PrimaryAuthPage();
