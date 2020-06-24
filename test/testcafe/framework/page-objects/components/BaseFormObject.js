import { Selector, ClientFunction } from 'testcafe';

export default class BaseFormObject {
  constructor (t, index) {
    this.t = t;
    this.form = new Selector('.o-form').nth(index || 0);
  }

  async setTextBoxValue(name, text) {
    const element = this.form.find(`input[name="${name}"]`);

    // clear exists text
    await this.t
      .selectText(element)
      .pressKey('delete');

    // type new text
    if (text) {
      await this.t.typeText(element, text);
    }
  }

  async getFormFieldLabel(fieldName) {
    const label = await this.findFormFieldInputLabel(fieldName).textContent;
    return label && label.trim();
  }

  elementExist(selector) {
    return this.form.find(selector).exists;
  }

  getElement(selector) {
    return this.form.find(selector);
  }

  getTitle() {
    return this.form.find('[data-se="o-form-head"]').innerText;
  }

  getSubtitle() {
    return this.form.find('[data-se="o-form-explain"]').innerText;
  }

  getSelectFormButtonLabel(selector) {
    return this.form.find(selector).innerText;
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
    return this.form.find(`.okta-form-infobox-error`).innerText;
  }

  hasTextBoxError(name) {
    return this.form.find(`.o-form-input-name-${name}.o-form-has-errors`).exists;
  }

  hasTextBoxErrorMessage(name) {
    return this.form.find(`.o-form-input-name-${name} + .o-form-input-error`).exists;
  }

  getTextBoxErrorMessage(name) {
    return this.form.find(`.o-form-input-name-${name} + .o-form-input-error`).innerText;
  }

  getCallout(selector) {
    return Selector(selector);
  }

  async waitForTextBoxError(name) {
    await this.hasTextBoxError(name);
  }

  async selectValueChozenDropdown(fieldName, index) {
    const selectContainer = await this.findFormFieldInput(fieldName)
      .find('.chzn-container');
    const containerId = await selectContainer.getAttribute('id');
    await this.t.click(selectContainer);

    const option = await new Selector(`#${containerId} .chzn-results .active-result`)
      .nth(index);
    await this.t.click(option);
  }

  async selectRadioButtonOption(fieldName, index) {
    const radioOption = await this.findFormFieldInput(fieldName)
      .find('.radio-label')
      .nth(index);
    const radioTextContent = await radioOption.textContent;
    const radioOptionLabel = radioTextContent.trim();
    await this.t.click(radioOption);

    return radioOptionLabel;
  }

  //////////////////////////////////////////////////
  // helper methods
  //////////////////////////////////////////////////

  findFormFieldInput(fieldName) {
    return this.form
      .find(`[data-se="o-form-input-${fieldName}"]`);
  }

  findFormFieldInputLabel(fieldName) {
    return this.form
      .find(`[data-se="o-form-input-${fieldName}"]`)
      .parent('[data-se="o-form-input-container"]')
      .sibling('[data-se="o-form-label"]')
      .child('label');
  }

}
