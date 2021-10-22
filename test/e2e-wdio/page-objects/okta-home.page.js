class OktaHomePage {
  get mainContent() { return $('.main-content'); }
  get username() { return $('[data-se=user-menu] .option-selected-text'); }

  async waitForPageLoad() {
    await browser.waitUntil(async () => {
      const currentUrl = await browser.getUrl();
      return currentUrl.includes('/app/UserHome');
    }, 5000, 'wait for Okta Home page');
    await browser.waitUntil(async () => this.mainContent.then(el => el.isDisplayed()), 5000, 'wait for mainContent');
  }

  async getLoggedInUser() {
    await browser.waitUntil(async () => this.username.then(el => el.isDisplayed()), 5000, 'wait for mainContent');
    return this.username.getText();
  }
}

export default new OktaHomePage();
