import BaseFormObject from './BaseFormObject';
import { Selector } from 'testcafe';

const FORM_SELECTOR = '[data-se="o-form"]';
const FORM_INFOBOX_ERROR_SELECTOR = '[data-se="message"] .infobox-error';

export default class BaseFormObjectV3 extends BaseFormObject {
  constructor(t, index = 0) {
    super(t);
    this.el = Selector(FORM_SELECTOR).nth(index);
  }

  getErrorBoxText() {
    return this.el.find(FORM_INFOBOX_ERROR_SELECTOR).innerText;
  }

  getAllErrorBoxTexts() {
    return this.getInnerTexts(FORM_INFOBOX_ERROR_SELECTOR);
  }
}
