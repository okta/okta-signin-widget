import BaseFormObject from './components/BaseFormObject';
import { Selector } from 'testcafe';

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

  getSaveButtonLabel() {
    return this.form.getElement('.button-primary').value;
  }

  getFormSubtitle() {
    return this.form.getSubtitle();
  }

  getTextContent(selector) {
    return Selector(selector).innerText;
  }
}
