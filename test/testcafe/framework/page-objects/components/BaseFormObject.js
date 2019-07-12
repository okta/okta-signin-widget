import { Selector, ClientFunction } from 'testcafe';

export default class BaseFormObject {
  constructor (t, index) {
    this.t = t;
    this.form = new Selector('.o-form').nth(index || 0);
  }

  async setTextBoxValue(name, text) {
    const element = this.form.find(`input[name="${name}"]`);
    if (!text) {
      await this.t
        .selectText(element)
        .pressKey('delete');
    } else {
      await this.t.typeText(element, text);
    }
  }

  getTextBoxValue(name) {
    return this.form.find(`input[name="${name}"]`).value;
  }

  async setCheckbox(name, value) {
    const checked = await this.form.find(`input[name="${name}"]`).checked;
    if (value !== checked) {
      await this.t.click(this.form.find(`input[name="${name}"] + label`));
    }
  }

  getCheckboxValue(name) {
    return this.form.find(`input[name="${name}"]`).checked;
  }

  async focusSaveButton() {
    // testcafe does not support actions for focus yet
    const focus = ClientFunction(() => {
      document.querySelector('.o-form-button-bar input[data-type="save"]').focus();
    });
    await focus();
  }

  async clickSaveButton() {
    await this.t.click(this.form.find('.o-form-button-bar input[data-type="save"]'));
  }

  async waitForErrorBox() {
    await this.form.find(`.okta-form-infobox-error`).exists;
  }

  hasTextBoxError(name) {
    return this.form.find(`.o-form-input-name-${name}.o-form-has-errors`).exists;
  }

  hasTextBoxErrorMessage(name) {
    return this.form.find(`.o-form-input-name-${name} + .o-form-input-error`).exists;
  }

  async waitForTextBoxError(name) {
    await this.hasTextBoxError(name);
  }
}
