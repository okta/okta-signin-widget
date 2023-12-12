import { userVariables } from 'testcafe';

import { screen, within } from '@testing-library/testcafe';

const CALLOUT_CONTENT_V3 = '.MuiAlert-message > div';

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
      return this.el.hasClass('MuiAlert-calloutWarning');
    }
    return this.el.hasClass('infobox-warning') &&
      this.el.child('[data-se="icon"]').hasClass('warning-16');
  }

  isError() {
    if (userVariables.gen3) {
      return this.el.hasClass('MuiAlert-calloutError');
    }
    return this.el.hasClass('infobox-error') &&
      this.el.find('[data-se="icon"]').hasClass('error-16');
  }

  getTextContent() {
    if (userVariables.gen3) {
      return this.el.find(CALLOUT_CONTENT_V3).textContent;
    }
    return this.el.child('[data-se="callout"]').child('div').textContent;
  }

}
