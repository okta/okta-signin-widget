import { Selector, userVariables } from 'testcafe';

const DATA_SE_CALLOUT = '[data-se="callout"]';

export default class CalloutObject {

  constructor(parent /* Selector */, index = 0) {
    if (parent) {
      this.el = parent.find(DATA_SE_CALLOUT).nth(index);
    } else {
      this.el = new Selector(DATA_SE_CALLOUT).nth(index);
    }
  }

  isWarning() {
    return this.el.hasClass('infobox-warning') &&
      this.el.child('[data-se="icon"]').hasClass('warning-16');
  }

  isError() {
    const hasInfoBoxErrorClass = this.el.hasClass('infobox-error');
    if (userVariables.v3) {
      return hasInfoBoxErrorClass;
    }
    return  hasInfoBoxErrorClass &&
      this.el.child('[data-se="icon"]').hasClass('error-16');
  }

  getTextContent() {
    if (userVariables.v3) {
      return this.el.innerText;
    }
    return this.el.child('div').textContent;
  }

}
