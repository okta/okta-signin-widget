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

  elementExist(selector) {
    return this.form.find(selector).exists;
  }

  getElement(selector) {
    return this.form.find(selector);
  }

  getSelectFormButtonLabel(selector) {
    return this.form.find(selector).textContent;
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

  async clickElement(selector) {
    await this.t.click(this.form.find(selector));
  }

  async clickSaveButton() {
    await this.t.click(this.form.find('.o-form-button-bar input[data-type="save"]'));
  }

  async waitForErrorBox() {
    await this.form.find(`.okta-form-infobox-error`).exists;
  }

  getErrorBoxText() {
    return this.form.find(`.okta-form-infobox-error`).textContent;
  }


  hasTextBoxError(name) {
    return this.form.find(`.o-form-input-name-${name}.o-form-has-errors`).exists;
  }

  hasTextBoxErrorMessage(name) {
    return this.form.find(`.o-form-input-name-${name} + .o-form-input-error`).exists;
  }

  getTextBoxErrorMessage(name) {
    return this.form.find(`.o-form-input-name-${name} + .o-form-input-error`).textContent;
  }

  getCallout(selector) {
    return Selector(selector);
  }

  async waitForTextBoxError(name) {
    await this.hasTextBoxError(name);
  }
}
