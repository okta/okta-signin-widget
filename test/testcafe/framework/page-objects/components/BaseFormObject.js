import { Selector, ClientFunction, userVariables } from 'testcafe';
import { screen, within } from '@testing-library/testcafe';

const TERMINAL_CONTENT = '.o-form-error-container .ion-messages-container';
const FORM_INFOBOX_ERROR = '[data-se="o-form-error-container"] .infobox-error';

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
    return screen.findByRole('heading', {
      level: 2,
    }).innerText;
  }

  getSubtitle() {
    return this.el.find('[data-se="o-form-explain"]').innerText;
  }

  getSelectFormButtonLabel(selector) {
    return this.el.find(selector).innerText;
  }

  /**
    * @param {string} name the text of the link to return
    */
  getLink(name) {
    return screen.queryByRole('link', {
      name,
    });
  }

  /**
   * @param {string} name The name or label of the text box to get
   * @param {boolean} findByLabel Find the text box by its label rather than name attribute
   */
  getTextBoxValue(name, findByLabel = false) {
    return findByLabel ?
      within(this.el).getByLabelText(name).value :
      this.el.find(`input[name="${name}"]`).value;
  }

  /**
   * @param {string} name The name or label of the text box to change
   * @param {string} text The text to set
   * @param {boolean} findByLabel Find the text box by its label rather than name attribute
   */
  async setTextBoxValue(name, text, findByLabel = false) {
    const element = findByLabel ?
      within(this.el).getByLabelText(new RegExp(name)) :
      this.el.find(`input[name="${name}"]`);

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

  getCheckbox(label) {
    return within(this.el).queryByRole('checkbox', {
      name: label,
    });
  }

  /**
   * @param {string} name The name or label of the checkbox to change
   * @param {boolean} value The checkbox value to set
   * @param {boolean} findByLabel Find the checkbox by its label rather than name attribute
   */
  async setCheckbox(name, value, findByLabel = false) {
    const checkbox = findByLabel ?
      this.getCheckbox(name) :
      this.el.find(`input[name="${name}"]`);

    const checked = checkbox.checked;
    if (value !== checked) {
      await this.t.click(checkbox);
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

  /**
   * @param {string} name the text of the button to return
   */
  getButton(name) {
    return within(this.el).getByRole('button', {
      value: name,
    });
  }

  /**
   * @param {string} name the text of the button to click
   */
  async clickSaveButton(name = 'Next') {
    const buttonToClick = this.getButton(name);

    await this.t.click(buttonToClick);
  }

  /**
   * @deprecated
   * @see clickSaveButton
   * Clicks the button with type=save, regardless of the button value
   */
  async clickSaveButtonAsInput() {
    const buttonToClick = this.el.find('[data-type="save"]');

    await this.t.click(buttonToClick);
  }

  async clickCancelButton() {
    await this.t.click(this.el.find(CANCEL_BUTTON_SELECTOR));
  }

  getSaveButtonLabel() {
    // in v3 buttons dont have a value prop
    if (userVariables.v3) {
      return within(this.el).getByRole('button').textContent;
    }

    return within(this.el).getByRole('button').value;
  }

  // =====================================
  // Error
  // =====================================

  // Error banner
  async waitForErrorBox() {
    await within(this.el).findByRole('alert', {
      name: /We found some errors/,
    }).exists;
  }

  getErrorBoxCount() {
    return this.el.find(FORM_INFOBOX_ERROR).count;
  }

  getErrorBoxText() {
    if (userVariables.v3) {
      return within(this.el).getByRole('alert').innerText;
    }

    return this.el.find(FORM_INFOBOX_ERROR).innerText;
  }

  hasErrorBox() {
    return within(this.el).getByRole('alert').exists;
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

  hasTextBoxErrorMessage(fieldName) {
    if (userVariables.v3) {
      return this.el.find(`#${fieldName}-error`).exists;
    }

    const selectContainer = this.findFormFieldInput(fieldName)
      .sibling('.o-form-input-error');

    return selectContainer.exists;
  }

  getTextBoxErrorMessage(fieldName) {
    if (userVariables.v3) {
      return this.el.find(`#${fieldName}-error`).innerText;
    }

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
