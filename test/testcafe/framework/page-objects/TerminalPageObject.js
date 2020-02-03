import { Selector } from 'testcafe';
import BasePageObject from './BasePageObject';

export default class TerminalPageObject extends BasePageObject {
  constructor(t) {
    super(t);
    this.body = new Selector('.terminal-state');
    this.footer = new Selector('.siw-main-footer');
  }

  getHeader() {
    return this.body.find('[data-se="o-form-head"]').innerText;
  }

  getFooterBackLink() {
    return this.footer.find('[data-se="back"]');
  }
}
