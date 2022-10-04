import { Selector, ClientFunction } from 'testcafe';
import { within } from '@testing-library/testcafe';

const TERMINAL_CONTENT = '.o-form-error-container .ion-messages-container';
const FORM_INFOBOX_ERROR = '[data-se="o-form-error-container"] .infobox-error';

const SUBMIT_BUTTON_SELECTOR = '[data-type="save"]';
const CANCEL_BUTTON_SELECTOR = '[data-type="cancel"]';

const focusOnSubmitButton = () => {
  // client function is not able to refer any variables defined outside
  const submitButton = '[data-type="save"]';
  document.querySelector(submitButton).focus();
};

export default class BaseFormObject {
  constructor(t, index) {
    this.t = t;
    this.el = new Selector('.o-form').nth(index || 0);
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
    return within(this.el).getByRole('heading', {
      level: 2,
    }).innerText;
  }

  getSubtitle() {
    return this.el.find('[data-se="o-form-explain"]').innerText;
  }

  getSelectFormButtonLabel(selector) {
    return this.el.find(selector).innerText;
  }

  getTextBoxValue(label) {
    return within(this.el).getByLabelText(label).value;
    // return this.el.find(`input[name="${name}"]`).value;
  }

  async setTextBoxValue(label, text) {
    const element = within(this.el).getByLabelText(label);

    // clear existing text
    await this.t
      .selectText(element)
      .pressKey('delete');

    // type new text
    if (text) {
      await this.t.typeText(element, text);
    }
  }

  // =====================================
  // Checkbox
  // =====================================

  async setCheckbox(label, value) {
    const checkbox = within(this.el).getByLabelText(label);
    // const checked = await this.el.find(`input[name="${name}"]`).checked;
    const checked = await checkbox.checked;
    if (value !== checked) {
      await this.t.click(checkbox);
      // await this.t.click(this.el.find(`input[name="${name}"] + label`));
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
    await this.t.click(within(this.el).getByRole('button', {
      value: 'Next',
    }));
    // await this.t.click(this.el.find(SUBMIT_BUTTON_SELECTOR));
  }

  async clickCancelButton() {
    await this.t.click(this.el.find(CANCEL_BUTTON_SELECTOR));
  }

  getNextButton() {
    return within(this.el).getByRole('button', {
      value: 'Next',
    });
  }

  getSaveButtonLabel() {
    return within(this.el).getByRole('button').value;
    // return this.el.find(SUBMIT_BUTTON_SELECTOR).value;
  }

  // =====================================
  // Error
  // =====================================

  // Error banner
  async waitForErrorBox() {
    await within(this.el).findByRole('alert', {
      name: /We found some errors/,
    }).exists;
    // await this.el.find(FORM_INFOBOX_ERROR).exists;
  }

  getErrorBoxCount() {
    return this.el.find(FORM_INFOBOX_ERROR).count;
  }

  getErrorBoxText() {
    const errorBox = within(this.el).getByRole('alert');

    return errorBox.innerText;
  }

  getAllErrorBoxTexts() {
    return this.getInnerTexts(FORM_INFOBOX_ERROR);
  }

  // Field error
  /**
   * @deprecated
   * @see hasTextBoxErrorMessage
   */
  hasTextBoxError(name) {
    return this.el.find(`.o-form-input-name-${name}.o-form-has-errors`).exists;
  }

  async waitForTextBoxError(name) {
    await this.hasTextBoxError(name);
  }

  hasTextBoxErrorMessage(errorMessage) {
    const selectContainer = within(this.el).getByText(errorMessage);

    return selectContainer.exists;
  }

  getTextBoxErrorMessage(fieldName) {
    const selectContainer = this.findFormFieldInput(fieldName)
      .sibling('.o-form-input-error');
    return selectContainer.innerText;
  }

  getNthErrorMessage(fieldName, value) {
    const selectContainer = this.findFormFieldInput(fieldName).sibling('.o-form-input-error').nth(value);
    return selectContainer.innerText;
  }
  // =====================================
  // Chozen Dropdown
  // =====================================

  getValueFromDropdown(fieldName) {
    const selectContainer = this.findFormFieldInput(fieldName).find('.chzn-container');
    return selectContainer.innerText;
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
