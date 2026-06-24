
class UnlockPage {
  get identifierField() { return $('input[name="identifier"]'); }
  get emailSelectButton() { return $('div[data-se="okta_email"]'); }
  get passwordField() { return $('input[name="credentials.passcode"]'); }
  get verifyButton() { return $('input[type="submit"]'); }
  get unlockPageMessage() { return $('div[class="ion-messages-container"]');}
  async selectEmailToUnlock() {
    this.emailSelectButton.Select();
  }
  async enterUserEmailToUnlock(userEmail) {
    await this.identifierField.setValue(userEmail);
    await this.emailSelectButton.click();
    await browser.pause(1000);
  }
  async enterPasswordAndVerify(userPassword) {
    await this.passwordField.setValue(userPassword);
    await this.verifyButton.isClickable().then((clickable) => {
      if(clickable) {
        this.verifyButton.click();
      }
    });
  }
  async assertUnlockMessage() {
    console.log("Trying to assert unlock message...");
    await this.unlockPageMessage.then(el => el.getText()).then(txt => {
      console.log(txt);
      // expect(txt).toBe('Account successfully unlocked! Verify your account with a security method to continue.');
      expect(txt).toContain('unlocked');
    });
  }

}
export default new UnlockPage();