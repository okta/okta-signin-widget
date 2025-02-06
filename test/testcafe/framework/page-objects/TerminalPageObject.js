import BasePageObject from './BasePageObject';
import CalloutObject from './components/CalloutObject';
import { userVariables, Selector, ClientFunction } from 'testcafe';
import { within } from '@testing-library/testcafe';

const TERMINAL_VIEW = '.siw-main-view.terminal';
export default class TerminalPageObject extends BasePageObject {

  constructor(t) {
    super(t);
  }

  async waitForTerminalView() {
    await this.form.el.find(TERMINAL_VIEW).exists;
  }

  getHeader() {
    return this.form.getTitle();
  }

  getErrorMessages() {
    return new CalloutObject(this.form.el);
  }

  getSuccessMessage() {
    return within(this.form.el).getByRole('alert').innerText;
  }

  getMessages(index) {
    if (userVariables.gen3) {
      return this.form.getSubtitle(index);
    }
    return this.form.getTerminalContent();
  }

  waitForErrorBox() {
    return this.form.waitForErrorBox();
  }

  doesTextExist(content) {
    return this.form.getByText(content).exists;
  }

  // Check for go back link unique to V2
  async goBackLinkExistsV2() {
    if(!userVariables.gen3) {
      return this.goBackLinkExists();
    }
    return false;
  }

  async getPageUrl() {
    await this.t.expect(Selector('#mock-user-dashboard-title', { timeout: 10000 }).innerText).eql('Mock User Dashboard');

    const pageUrl = await ClientFunction(() => window.location.href)();
    return pageUrl;
  }

  getADPInstallRemediationLink() {
    const labelText = 'Install the Android Device Policy app on this device';
    if (userVariables.gen3) {
      return this.form.getLink(labelText);
    } else {
      return this.form.getButton(labelText);
    }
  }

  async adpOVInstallInstructionsMessageExists() {
    return this.form.getByTextFn((_, element) =>
      element.textContent === 'Go to Settings in Okta Verify and follow the instructions to install the Android Device Policy app').exists;
  }

  async adpInstallRemediationLinkExists() {
    return this.getADPInstallRemediationLink().exists;
  }

  async clickADPInstallRememdiationLink() {
    await this.t.click(this.getADPInstallRemediationLink());
  }

  getErrorBoxAnchorsWithText(text) {
    return Selector('a').withText(text);
  }
}
