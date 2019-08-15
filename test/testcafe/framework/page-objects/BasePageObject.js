export default class BasePageObject {
  constructor(t) {
    this.t = t;
    this.url = '';
  }

  async navigateToPage() {
    await this.t.navigateTo(`http://localhost:3000${this.url}`);
  }
}
