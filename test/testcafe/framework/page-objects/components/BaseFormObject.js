import { Selector, ClientFunction } from 'testcafe';

const TERMINAL_CONTENT = '.o-form-error-container .ion-messages-container';

export default class BaseFormObject {
  constructor (t, index) {
    this.t = t;
    this.el = new Selector('.o-form').nth(index || 0);
  }

  async setTextBoxValue(name, text) {
    const element = this.el.find(`input[name="${name}"]`);

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

  getTerminalContent() {
    return Selector(TERMINAL_CONTENT).textContent;
  }

  elementExist(selector) {
    return this.el.find(selector).exists;
  }

  getElement(selector) {
    return this.el.find(selector);
  }

  getTitle() {
    return this.el.find('[data-se="o-form-head"]').innerText;
  }

  getSubtitle() {
    return this.el.find('[data-se="o-form-explain"]').innerText;
  }

  getSelectFormButtonLabel(selector) {
    return this.el.find(selector).innerText;
  }

  getTextBoxValue(name) {
    return this.el.find(`input[name="${name}"]`).value;
  }

  async setCheckbox(name, value) {
    const checked = await this.el.find(`input[name="${name}"]`).checked;
    if (value !== checked) {
      await this.t.click(this.el.find(`input[name="${name}"] + label`));
    }
  }

  getCheckboxValue(name) {
    return this.el.find(`input[name="${name}"]`).checked;
  }

  async focusSaveButton() {
    // testcafe does not support actions for focus yet
    const focus = ClientFunction(() => {
      document.querySelector('.o-form-button-bar input[data-type="save"]').focus();
    });
    await focus();
  }

  async clickElement(selector) {
    await this.t.click(this.el.find(selector));
  }

  async clickSaveButton() {
    await this.t.click(this.el.find('.o-form-button-bar input[data-type="save"]'));
  }

  // =====================================
  // Error
  // =====================================

  // Error banner
  async waitForErrorBox() {
    await this.el.find(`.okta-form-infobox-error`).exists;
  }

  getErrorBoxText() {
    return this.el.find(`.okta-form-infobox-error`).innerText;
  }

  // Field error
  /**
   * @deprecated see hasTextBoxErrorMessage
   */
  hasTextBoxError(name) {
    return this.el.find(`.o-form-input-name-${name}.o-form-has-errors`).exists;
  }

  async waitForTextBoxError(name) {
    await this.hasTextBoxError(name);
  }

  hasTextBoxErrorMessage(fieldName) {
    const selectContainer = this.findFormFieldInput(fieldName)
      .sibling('.o-form-input-error');
    return selectContainer.exists;
  }

  getTextBoxErrorMessage(fieldName) {
    const selectContainer = this.findFormFieldInput(fieldName)
      .sibling('.o-form-input-error');
    return selectContainer.innerText;
  }

  // =====================================
  // Chozen Dropdown
  // =====================================

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

  // =====================================
  // helper methods
  // =====================================

  findFormFieldInput(fieldName) {
    return this.el
      .find(`[data-se="o-form-input-${fieldName}"]`);
  }

  findFormFieldInputLabel(fieldName) {
    return this.el
      .find(`[data-se="o-form-input-${fieldName}"]`)
      .parent('[data-se="o-form-input-container"]')
      .sibling('[data-se="o-form-label"]')
      .child('label');
  }

  // =====================================
  // un-categoried
  // =====================================

  getCallout(selector) {
    return Selector(selector);
  }

}
