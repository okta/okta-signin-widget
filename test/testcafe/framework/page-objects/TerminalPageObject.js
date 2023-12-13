import BasePageObject from './BasePageObject';
import CalloutObject from './components/CalloutObject';
import { userVariables, Selector, ClientFunction } from 'testcafe';
import { within } from '@testing-library/testcafe';

const TERMINAL_VIEW = '.siw-main-view.terminal';
const CALLOUT_CONTEXT_V3 = '.MuiAlert-message > div';
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
    if (userVariables.gen3) {
      return within(this.form.el).getByRole('alert').find(CALLOUT_CONTEXT_V3).innerText;
    }
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
}
