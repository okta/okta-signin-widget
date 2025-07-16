import { Selector, ClientFunction, userVariables } from 'testcafe';
import { screen, within } from '@testing-library/testcafe';

const TERMINAL_CONTENT = '.o-form-error-container .ion-messages-container';
const FORM_INFOBOX_ERROR = '[data-se="o-form-error-container"] .infobox-error';
const FORM_INFOBOX_ERROR_TITLE = '[data-se="o-form-error-container"] [data-se="callout"] > h3';
const CALLOUT = '[data-se="callout"]';

const CANCEL_BUTTON_SELECTOR = userVariables.gen3 ? '[data-se="cancel"]' : '[data-type="cancel"]';
const SAVE_BUTTON_SELECTOR = userVariables.gen3 ? '[data-se="save"]' : '[data-type="save"]';

const focusOnSubmitButton = (saveButtonSelector) => {
  // client function is not able to refer any variables defined outside
  document.querySelector(saveButtonSelector).focus();
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

  fieldByLabelExists(label, options = undefined) {
    return within(this.el).queryByLabelText(new RegExp(label), options).exists;
  }

  getElement(selector) {
    return this.el.find(selector);
  }

  getTitle() {
    return screen.findByRole('heading', {
      level: userVariables.gen3 ? 1 : 2,
    }).innerText;
  }

  getNthTitle(index) {
    return screen.findAllByRole('heading', {
      level: userVariables.gen3 ? 1 : 2,
    }).nth(index).innerText;
  }

  getSubtitle(index) {
    if (index === undefined) {
      index = 0;
    }
    return this.el.find('[data-se="o-form-explain"]').nth(index).innerText;
  }

  getErrorTitle() {
    if (userVariables.gen3) {
      return within(this.getErrorBox()).findByRole('heading', { level: 2 }).innerText;
    }
    return this.getElement(FORM_INFOBOX_ERROR_TITLE).innerText;
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

  getTextBox(name, findByLabel) {
    return findByLabel ?
      within(this.el).getByLabelText(name) :
      this.el.find(`input[name="${name}"]`);
  }

  /**
   * @param {string} name The name or label of the text box to get
   * @param {boolean} findByLabel Find the text box by its label rather than name attribute
   */
  getTextBoxValue(name, findByLabel = false) {
    return this.getTextBox(name, findByLabel).value;
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
      await this.clickCheckboxElement(checkbox);
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
    await focus(SAVE_BUTTON_SELECTOR);
  }

  /**
   * @param {(string|RegExp)} name the text of the button to return
   */
  getButton(name) {
    const options = userVariables.gen3 ? { name } : { value: name };
    return within(this.el).getByRole('button', options);
  }

  /**
   * @param {string} name the text of the button to return
   */
  queryButton(name) {
    const options = userVariables.gen3 ? { name } : { value: name };
    return within(this.el).queryByRole('button', options);
  }

  /**
   * @param {string} name the text of the button to click
   */
  async clickButton(name) {
    const buttonToClick = this.getButton(name);

    await this.t.click(buttonToClick);
  }

  getAllButtons() {
    return within(this.el).getAllByRole('button');
  }

  /**
   * @param {string} name the text of the save button to click
   */
  async clickSaveButton(name = 'Next') {
    await this.clickButton(name);
  }

  isSaveButtonDisabled(name = 'Next') {
    const button = this.getButton(name);
    if (userVariables.gen3) {
      return button.hasAttribute('disabled');
    }
    return button.hasClass('link-button-disabled');
  }

  /**
   * @deprecated
   * @see clickSaveButton
   * Clicks the button with type=save, regardless of the button value
   */
  async clickSaveButtonAsInput() {
    const buttonToClick = this.el.find(SAVE_BUTTON_SELECTOR);

    await this.t.click(buttonToClick);
  }

  async clickCancelButton() {
    await this.t.click(this.el.find(CANCEL_BUTTON_SELECTOR));
  }

  getSaveButtonLabel() {
    // in v3 buttons dont have a value prop
    if (userVariables.gen3) {
      return this.el.find(SAVE_BUTTON_SELECTOR).textContent;
    }
    return this.el.find(SAVE_BUTTON_SELECTOR).value;
  }

  getByLabelText(text, options = undefined) {
    return within(this.el).getByLabelText(new RegExp(text), options);
  }

  getByText(text, options = undefined) {
    return within(this.el).getByText(text, options);
  }

  getByTextFn(textFn) {
    return within(this.el).getByText(textFn);
  }

  getCancelButtonLabel() {
    // in v3 buttons dont have a value prop
    if (userVariables.gen3) {
      return this.el.find(CANCEL_BUTTON_SELECTOR).textContent;
    }
    return this.el.find(CANCEL_BUTTON_SELECTOR).value;
  }

  // =====================================
  // Error
  // =====================================

  async waitForAnyAlertBox(options = undefined) {
    await within(this.el).findAllByRole('alert', options).exists;
  }

  // Error banner
  async waitForErrorBox() {
    await within(this.el).findByRole('alert', {
      name: /We found some errors/,
    }).exists;
  }

  getAllAlertBoxes() {
    return within(this.el).queryAllByRole('alert');
  }

  getAlertBox() {
    return this.getAllAlertBoxes().nth(0);
  }

  getErrorBoxCount() {
    if (userVariables.gen3) {
      return this.getAllAlertBoxes().count;
    }

    return this.el.find(FORM_INFOBOX_ERROR).count;
  }

  getErrorBox() {
    if (userVariables.gen3) {
      return this.getAlertBox();
    }

    return this.el.find(FORM_INFOBOX_ERROR);
  }

  getErrorBoxText() {
    return this.getErrorBox().innerText;
  }

  getErrorBoxCallout() {
    return this.getCallout(CALLOUT);
  }

  getErrorBoxHtml() {
    return this.getCallout(CALLOUT).innerHTML;
  }

  getAlertBoxText() {
    if (userVariables.gen3) {
      return this.getAlertBox().innerText;
    } else {
      // Not implemented/required in v2
    }
  }

  hasErrorBox() {
    return within(this.el).queryByRole('alert').exists;
  }

  hasAlertBox(index = 0) {
    return within(this.el).queryAllByRole('alert').nth(index).exists;
  }

  getAllErrorBoxTexts() {
    return this.getInnerTexts(FORM_INFOBOX_ERROR);
  }

  async getErrorBoxTextByIndex(index) {
    if (userVariables.gen3) {
      return await within(this.el).findAllByRole('alert').nth(index).innerText;
    }
    const errors = await this.getAllErrorBoxTexts();
    return errors[index];
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
    await this.hasTextBoxErrorMessage(name);
  }

  hasTextBoxErrorMessage(fieldName, index = undefined) {
    if (userVariables.gen3) {
      return this.el.find(`[id="${fieldName}-error${index !== undefined ? '-' + index : ''}"]`).exists;
    }

    const selectContainer = this.findFormFieldInput(fieldName)
      .sibling('.o-form-input-error');

    return selectContainer.exists;
  }

  getTextBoxErrorMessage(fieldName, index = undefined) {
    if (userVariables.gen3) {
      return this.el.find(`[id="${fieldName}-error${index !== undefined ? '-' + index : ''}"]`).innerText;
    }

    const selectContainer = this.findFormFieldInput(fieldName)
      .sibling('.o-form-input-error');
    return selectContainer.innerText;
  }

  getNthErrorMessage(fieldName, value) {
    if (userVariables.gen3) {
      return this.el.find(`#${fieldName}-error`).child('div').child('ul').child('li').nth(value).innerText;
    }
    const selectContainer = this.findFormFieldInput(fieldName).sibling('.o-form-input-error').nth(value);
    return selectContainer.innerText;
  }
  // =====================================
  // Chozen Dropdown
  // =====================================

  getValueFromDropdown(fieldName, index = 0) {
    if (userVariables.gen3) {
      const selectEle = this.el.find(`[id="${fieldName}"]`);
      const option = selectEle.child().nth(index);
  
      return option.textContent;
    }
    const selectContainer = this.findFormFieldInput(fieldName).find('.chzn-container');
    return selectContainer.innerText;
  }

  async selectValueChozenDropdown(fieldName, index) {
    if (userVariables.gen3) {
      const selectEle = this.el.find(`[id="${fieldName}"]`);
      await this.t.click(selectEle);
      
      const option = selectEle.child().nth(index);
      await this.t.click(option);
      return;
    }
    const selectContainer = await this.findFormFieldInput(fieldName)
      .find('.chzn-container');
    const containerId = await selectContainer.getAttribute('id');
    await this.t.click(selectContainer);

    const option = await new Selector(`#${containerId} .chzn-results .active-result`)
      .nth(index);
    await this.t.click(option);
  }

  async openChozenDropdown(fieldName) {
    if (userVariables.gen3) {
      const selectEle = this.el.find(`[id="${fieldName}"]`);
      await this.t.click(selectEle);
    } else {
      const selectContainer = await this.findFormFieldInput(fieldName)
        .find('.chzn-container');
      await this.t.click(selectContainer);
    }
  }

  isChozenDropdownOpened() {
    return Selector('.chzn-container').exists;
  }

  // =====================================
  // radio button
  // =====================================

  async selectRadioButtonOption(fieldName, index) {
    if (userVariables.gen3) {
      const radioEle = await this.el.find(`[data-se="${fieldName}"]`);

      const radioOpt = await radioEle.child().nth(index);
      await this.t.click(radioOpt);
      const optionLabel = await radioOpt.textContent;

      return optionLabel;
    }
    const radioOption = await this.findFormFieldInput(fieldName)
      .find('.radio-label')
      .nth(index);
    const radioTextContent = await radioOption.textContent;
    const radioOptionLabel = radioTextContent.trim();
    await this.t.click(radioOption);

    return radioOptionLabel;
  }

  async selectRadioButtonOptionByValue(fieldName, value) {
    if (userVariables.gen3) {
      const radioOption = await this.el.find(`input[type="radio"][value="${value}"]`);
      await this.t.click(radioOption); 

      const label = this.el
        .find(`input[type="radio"][value="${value}"]`)
        .parent('span')
        .parent('label')
        .textContent;

      return label; 
    }
    
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
    if (userVariables.gen3) {
      return this.el
        .find(`[data-se="${fieldName}"]`);     
    }
    return this.el
      .find(`[data-se="o-form-input-${fieldName}"]`);
  }

  findFormFieldInputLabel(fieldName) {
    if (userVariables.gen3) {
      return this.el
        .find(`label[for="${fieldName}"]`)
        // get first text node
        .find((_node, index) => index === 0);
    } else {
      return this.el
        .find(`[data-se="o-form-input-${fieldName}"]`)
        .parent('[data-se="o-form-input-container"]')
        .sibling('[data-se="o-form-label"]')
        .child('label');
    }
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
    return Selector(selector).addCustomDOMProperties({
      innerHTML: el => el.innerHTML,
    });
  }

  async clickCheckboxElement(checkboxElement) {
    // Using `t.click()` in TestCafe 3 produces warning for Gen2:
    //  TestCafe cannot interact with the <input type="checkbox"> element because another element obstructs it.
    //  When something overlaps the action target, TestCafe performs the action with the topmost element at the original target's location.
    //  The following element with a greater z-order replaced the original action target: <label ..>.
    //  Review your code to prevent this behavior.
    await this.t.dispatchEvent(checkboxElement, 'click');
  }

  async clickCheckbox(selector) {
    await this.clickCheckboxElement(this.el.find(selector));
  }

  async clickElement(selector) {
    await this.t.click(this.el.find(selector));
  }

  getSpinner() {
    return within(this.el).queryByLabelText('Processing...');
  }

  getButtonIcon(buttonName) {
    return within(this.getButton(buttonName)).getByRole('img');
  }

  getAnchorsWithBlankTargetsWithoutRelevantAttributes() {
    return Selector('a[target="_blank"]')
      .filter((node) => {
        const relValues = (node.getAttribute('rel') || '').split(' ');
        return !(relValues.includes('noopener') && relValues.includes('noreferrer'));
      });
  }

  getErrorBoxAnchor(url) {
    return this.getErrorBoxCallout().find(`a[href="${url}"]`);
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
