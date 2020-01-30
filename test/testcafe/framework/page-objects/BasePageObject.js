import BaseFormObject from './components/BaseFormObject';

export default class BasePageObject {
  constructor(t) {
    this.t = t;
    this.url = '';
    this.form = new BaseFormObject(t);
  }

  async navigateToPage() {
    await this.t.navigateTo(`http://localhost:3000${this.url}`);
  }

  getFormTitle() {
    return this.form.getTitle();
  }

  getFormSubtitle() {
    return this.form.getSubtitle();
  }
}
