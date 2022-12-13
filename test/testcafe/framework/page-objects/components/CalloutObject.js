import { userVariables } from 'testcafe';

import { screen, within } from '@testing-library/testcafe';

export default class CalloutObject {

  constructor(parent /* Selector */, index = 0) {
    if (parent) {
      this.el = within(parent).getAllByRole('alert').nth(index);
    } else {
      this.el = screen.getAllByRole('alert').nth(index);
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
    return hasInfoBoxErrorClass &&
      this.el.find('[data-se="icon"]').hasClass('error-16');
  }

  getTextContent() {
    if (userVariables.v3) {
      return this.el.textContent;
    }
    return this.el.child('[data-se="callout"]').child('div').textContent;
  }

}
