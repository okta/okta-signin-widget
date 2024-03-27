import { RequestMock, RequestLogger } from 'testcafe';

import ChallengeEmailPageObject from '../framework/page-objects/ChallengeEmailPageObject';
import SuccessPageObject from '../framework/page-objects/SuccessPageObject';
import { oktaDashboardContent } from '../framework/shared';

import emailVerificationWithPolling from '../../../playground/mocks/data/idp/idx/authenticator-verification-email-polling-short';
import successRedirectRemediation from '../../../playground/mocks/data/idp/idx/success-redirect-remediation';

const emailPollSuccessMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(emailVerificationWithPolling)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(successRedirectRemediation)
  .onRequestTo(/^http:\/\/localhost:3000\/app\/UserHome.*/)
  .respond(oktaDashboardContent);

const pollRequestLogger = RequestLogger(/poll/);

fixture('Redirect on Polling');

function getChromeClient(t) {
  // Get internal Chrome DevTools client
  const openedBrowsers = t.testRun.browserConnection.provider.plugin.openedBrowsers;
  const openedBrowser = openedBrowsers[Object.keys(openedBrowsers)[0]];
  const clients = openedBrowser.browserClient._clients;
  const client = clients[Object.keys(clients)[0]].client;
  return client;
}

async function openNewTab(t, url = '') {
  // https://chromedevtools.github.io/devtools-protocol/tot/Target/#method-createTarget
  const client = getChromeClient(t);
  const { targetId } = await client.Target.createTarget({
    // The initial URL the page will be navigated to. An empty string indicates about:blank
    url,
    // Whether to create a new Window or Tab (chrome-only, false by default)
    newWindow: false,
    // Whether to create the target in background or foreground (chrome-only, false by default)
    background: false,
    // Whether to create the target of type "tab"
    forTab: true,
  });
  return targetId;
}

async function closeTab(t, targetId) {
  // https://chromedevtools.github.io/devtools-protocol/tot/Target/#method-closeTarget
  const client = getChromeClient(t);
  await client.Target.closeTarget({ targetId });
}

async function setup(t) {
  const challengeEmailPageObject = new ChallengeEmailPageObject(t);
  await challengeEmailPageObject.navigateToPage();
  await t.expect(challengeEmailPageObject.formExists()).ok();
  return challengeEmailPageObject;
}

async function expectNoRedirect(t) {
  const challengeEmailPageObject = new ChallengeEmailPageObject(t);
  const pageUrl = await challengeEmailPageObject.getPageUrl();
  return t.expect(pageUrl)
    .eql('http://localhost:3000/');
}

async function expectRedirect(t) {
  const successPage = new SuccessPageObject(t);
  const pageUrl = await successPage.getPageUrl();
  return t.expect(pageUrl)
    .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
}


test.requestHooks(pollRequestLogger, emailPollSuccessMock)('should redirect immediately on visible page', async t => {
  await setup(t);
  await expectNoRedirect(t);

  // wait for polling to succeed
  await t.expect(pollRequestLogger.count(() => true)).eql(1);
  // should auto redirect
  await expectRedirect(t);
});

test.requestHooks(pollRequestLogger, emailPollSuccessMock)('should wait for visible page before redirect', async t => {
  await setup(t);
  await expectNoRedirect(t);

  // open new tab, original tab should become inactive
  const tabId = await openNewTab(t);
  // wait for polling to succeed
  await t.expect(pollRequestLogger.count(() => true)).eql(1);
  await t.wait(500);
  // should not auto redirect
  await expectNoRedirect(t);

  // close tab, original tab should become active
  await closeTab(t, tabId);
  // should auto redirect
  await expectRedirect(t);
});
