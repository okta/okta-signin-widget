export default class BasePageObject {
  constructor(t) {
    this.t = t;
  }

  async navigateToPage() {
    await this.t.navigateTo(`http://localhost:3000${this.url}?hideNav=true`);
  }
}
