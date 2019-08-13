import BasePageObject from './BasePageObject';
import BaseFormObject from './components/BaseFormObject';

export default class PrimaryAuthPageObject extends BasePageObject {
  constructor (t) {
    super(t);
    this.url = '';
    this.form = new BaseFormObject(t);
  }

  fillUsernameField(value) {
    return this.form.setTextBoxValue('username', value);
  }

  fillPasswordField(value) {
    return this.form.setTextBoxValue('password', value);
  }

  setRememberMeField(value) {
    return this.form.setCheckbox('remember', value);
  }

  getUsernameValue() {
    return this.form.getTextBoxValue('username');
  }

  getPasswordValue() {
    return this.form.getTextBoxValue('password');
  }

  getRememberMeValue() {
    return this.form.getCheckboxValue('remember');
  }

  clickSignInButton() {
    return this.form.clickSaveButton();
  }

  waitForErrorBox() {
    return this.form.waitForErrorBox();
  }

  hasUsernameError() {
    return this.form.hasTextBoxError('username');
  }

  hasUsernameErrorMessage() {
    return this.form.hasTextBoxErrorMessage('username');
  }

  hasPasswordError() {
    return this.form.hasTextBoxError('password');
  }

  hasPasswordErrorMessage() {
    return this.form.hasTextBoxErrorMessage('password');
  }

  waitForPasswordError(){
    return this.form.waitForTextBoxError('password');
  }
}
