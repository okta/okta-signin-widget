import { Selector } from 'testcafe';

export default class FooterLinkObject {

  constructor(t, selector) {
    this.t = t;
    this.el = new Selector(`.siw-main-footer ${selector}`);
  }

  getLabel() {
    return this.el.textContent;
  }

  async exists() {
    const count = await this.el.count;
    return count === 1;
  }

  async click() {
    return this.t.click(this.el);
  }

}
