import BaseFormObject from './BaseFormObject';
import { Selector } from 'testcafe';

const FORM_SELECTOR = '[data-se="form"]';
const SUBMIT_BUTTON_SELECTOR = '[data-type="save"]';
const FORM_INFOBOX_ERROR_SELECTOR = '[data-se="message"][data-type="error"]';

export default class BaseFormObjectV3 extends BaseFormObject {
  constructor(t, index = 0) {
    super(t);
    this.el = Selector(FORM_SELECTOR).nth(index);
  }

  async setTextBoxValue(name, text) {
    const element = this.el.find(`[data-se="${name}"]`);

    // clear exists text
    await this.t
      .selectText(element)
      .pressKey('delete');

    // type new text
    if (text) {
      await this.t.typeText(element, text);
    }
  }

  // =====================================
  // Button bar
  // =====================================

  async clickSaveButton() {
    await this.t.click(this.el.find(SUBMIT_BUTTON_SELECTOR));
  }

  getSaveButtonLabel() {
    return this.el.find(SUBMIT_BUTTON_SELECTOR).textContent;
  }

  // =====================================
  // Error
  // =====================================

  // Error banner
  async waitForErrorBox() {
    await this.el.find(FORM_INFOBOX_ERROR_SELECTOR).exists;
  }
  async getTextBoxErrorMessage(fieldName) {
    const input = this.findFormFieldInput(fieldName);
    const errorId = await input?.getAttribute('aria-describedby');
    return this.el.find(`#${errorId}`).innerText;
  }

  // =====================================
  // helper methods
  // =====================================

  findFormFieldInput(fieldName) {
    return this.el
      .find(`[data-se="${fieldName}"]`);
  }
}
