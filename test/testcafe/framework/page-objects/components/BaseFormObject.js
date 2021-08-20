import { Selector, ClientFunction } from 'testcafe';

const TERMINAL_CONTENT = '.o-form-error-container .ion-messages-container';
const FORM_INFOBOX_ERROR = '[data-se="o-form-error-container"] .infobox-error';

const SUBMIT_BUTTON_SELECTOR = '.o-form-button-bar input[data-type="save"]';
const CANCEL_BUTTON_SELECTOR = '.o-form-button-bar input[data-type="cancel"]';

const focusOnSubmitButton = () => {
  // Client Function is not able to refer any variables defined outside this function.
  // Not sure why at the time of writing.
  const submitButton = '.o-form-button-bar input[data-type="save"]';
  document.querySelector(submitButton).focus();
};

export default class BaseFormObject {
  constructor(t, index) {
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

  // =====================================
  // Checkbox
  // =====================================
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

  // =====================================
  // Button bar
  // =====================================

  async focusSaveButton() {
    // testcafe does not support actions for focus yet
    const focus = ClientFunction(focusOnSubmitButton);
    await focus();
  }

  async clickSaveButton() {
    await this.t.click(this.el.find(SUBMIT_BUTTON_SELECTOR));
  }

  async clickCancelButton() {
    await this.t.click(this.el.find(CANCEL_BUTTON_SELECTOR));
  }

  getSaveButtonLabel() {
    return this.el.find(SUBMIT_BUTTON_SELECTOR).value;
  }

  // =====================================
  // Error
  // =====================================

  // Error banner
  async waitForErrorBox() {
    await this.el.find(FORM_INFOBOX_ERROR).exists;
  }

  getErrorBoxCount() {
    return this.el.find(FORM_INFOBOX_ERROR).count;
  }

  getErrorBoxText() {
    return this.el.find(FORM_INFOBOX_ERROR).innerText;
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


  // =====================================
  // radio button
  // =====================================

  async selectRadioButtonOption(fieldName, index) {
    const radioOption = await this.findFormFieldInput(fieldName)
      .find('.radio-label')
      .nth(index);
    const radioTextContent = await radioOption.textContent;
    const radioOptionLabel = radioTextContent.trim();
    await this.t.click(radioOption);

    return radioOptionLabel;
  }

  async selectRadioButtonOptionByValue(fieldName, value) {
    const radioOption = await this.findFormFieldInput(fieldName)
      .find(`input[value="${value}"] + .radio-label`);

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

  getFormFieldSubLabel(fieldName) {
    const label = this.el
      .find(`[data-se="o-form-input-${fieldName}"]`)
      .parent('[data-se="o-form-input-container"]')
      .sibling('[data-se="o-form-label"]')
      .child('span');

    return label.innerText;
  }

  // =====================================
  // un-categoried
  // =====================================

  getCallout(selector) {
    return Selector(selector);
  }

  async clickElement(selector) {
    await this.t.click(this.el.find(selector));
  }

  /**
   * Queries for all elements matching the selector
   * and returns a list of inner texts of the matching elements.
   * @param {string} selector
   * @returns {array}
   */
  getInnerTexts(selector) {
    return ClientFunction((selector) => {
      return Array.prototype.map.call(document.querySelectorAll(selector), (el) => {
        return el.innerText;
      });
    })(selector);
  }
}
