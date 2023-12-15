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
    if (userVariables.gen3) {
      return this.el.parent().hasAttribute('data-se', 'infobox-warning');
    }
    return this.el.hasClass('infobox-warning') &&
      this.el.child('[data-se="icon"]').hasClass('warning-16');
  }

  isError() {
    if (userVariables.gen3) {
      return this.el.parent().hasAttribute('data-se', 'infobox-error');
    }
    return this.el.hasClass('infobox-error') &&
      this.el.find('[data-se="icon"]').hasClass('error-16');
  }

  getTextContent() {
    if (userVariables.gen3) {
      return this.el.innerText;
    }
    return this.el.child('[data-se="callout"]').child('div').innerText;
  }

}
