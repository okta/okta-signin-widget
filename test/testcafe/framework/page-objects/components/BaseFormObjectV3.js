import BaseFormObject from './BaseFormObject';
import { Selector } from 'testcafe';

const SUBMIT_BUTTON_SELECTOR = '[data-type="save"]';
const FORM_INFOBOX_ERROR = '[data-se="message-container"] [data-type="error"]';

export default class BaseFormObjectV3 extends BaseFormObject {
  constructor(t, index = 0) {
    super(t);
    this.el = Selector('[data-se="form"]').nth(index);
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

  // =====================================
  // Error
  // =====================================

  // Error banner
  async waitForErrorBox() {
    await this.el.find(FORM_INFOBOX_ERROR).exists;
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
