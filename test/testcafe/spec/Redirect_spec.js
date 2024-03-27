import { RequestMock, RequestLogger, ClientFunction } from 'testcafe';

import ChallengeEmailPageObject from '../framework/page-objects/ChallengeEmailPageObject';
import { oktaDashboardContent } from '../framework/shared';
import successRedirectRemediation from '../../../playground/mocks/data/idp/idx/success-redirect-remediation';
import emailVerification from '../../../playground/mocks/data/idp/idx/authenticator-verification-email';

const emailPollSuccessMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(emailVerification)
  .onRequestTo('http://localhost:3000/idp/idx/poll')
  .respond(successRedirectRemediation)
  .onRequestTo(/^http:\/\/localhost:3000\/app\/UserHome.*/)
  .respond(oktaDashboardContent);

const pollRequestLogger = RequestLogger(/poll/);

fixture('Redirect on Polling');

function getChromeClient(t) {
  const openedBrowsers = t.testRun.browserConnection.provider.plugin.openedBrowsers;
  const openedBrowser = openedBrowsers[Object.keys(openedBrowsers)[0]];
  const clients = openedBrowser.browserClient._clients;
  const client = clients[Object.keys(clients)[0]].client;
  return client;
}

async function openInNewTab(t, url = '') {
  const client = getChromeClient(t);
  const { targetId } = await client.Target.createTarget({
    // The initial URL the page will be navigated to. An empty string indicates about:blank
    url,
    // Whether to create a new Window or Tab (chrome-only, false by default).
    newWindow: false,
    // Whether to create the target in background or foreground (chrome-only, false by default).
    background: false,
    // Whether to create the target of type "tab".
    forTab: true,
  });
  return targetId;
}

async function closeTab(t, targetId) {
  const client = getChromeClient(t);
  await client.Target.closeTarget({ targetId });
}

async function getCurrentUrl() {
  return await ClientFunction(() => window.location.href)();
}

async function setup(t) {
  const challengeEmailPageObject = new ChallengeEmailPageObject(t);
  await challengeEmailPageObject.navigateToPage();
  await t.expect(challengeEmailPageObject.formExists()).ok();
  return challengeEmailPageObject;
}


test.requestHooks(pollRequestLogger, emailPollSuccessMock)('should redirect immediately on visible page', async t => {
  await setup(t);
  const currentUrl1 = await getCurrentUrl();
  await t.expect(currentUrl1).eql('http://localhost:3000/');

  // wait for polling to succeed
  await t.expect(pollRequestLogger.count(() => true)).eql(1);
  await t.wait(500);

  // should auto redirect
  const currentUrl2 = await getCurrentUrl();
  await t.expect(currentUrl2).eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
});

test.requestHooks(pollRequestLogger, emailPollSuccessMock)('should wait for visible page before redirect', async t => {
  await setup(t);
  await t.expect(pollRequestLogger.count(() => true)).eql(0);

  // open new tab, original tab should become inactive
  const tabId = await openInNewTab(t);
  // wait for polling to succeed
  await t.expect(pollRequestLogger.count(() => true)).eql(1);
  await t.wait(500);
  // should not auto redirect
  const currentUrl1 = await getCurrentUrl();
  await t.expect(currentUrl1).eql('http://localhost:3000/');

  // close tab, original tab should become active
  await closeTab(t, tabId);
  await t.wait(500);
  // should auto redirect
  const currentUrl2 = await getCurrentUrl();
  await t.expect(currentUrl2).eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
});
