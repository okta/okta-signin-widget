import { RequestMock } from 'testcafe';
import { checkA11y } from '../framework/a11y';
import DeviceChallengePollPageObject from '../framework/page-objects/DeviceChallengePollPageObject';
import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import identify from '../../../playground/mocks/data/idp/idx/identify';
import deviceProbingChromeDTC from '../../../playground/mocks/data/idp/idx/device-probing-chrome-dtc';
import identifyWithDeviceProbingLoopback from '../../../playground/mocks/data/idp/idx/identify-with-device-probing-loopback';

const mockChromeProbingView = RequestMock()
  .onRequestTo(/\/idp\/idx\/introspect/)
  .respond((req, res) => {
    res.statusCode = '200';
    res.headers['content-type'] = 'application/json';
    res.setBody(deviceProbingChromeDTC);
  })
  .onRequestTo(/\/idp\/idx\/authenticators\/poll/)
  .respond((req, res) => {
    res.statusCode = '200';
    res.headers['content-type'] = 'application/json';
    res.setBody(deviceProbingChromeDTC);
  });

const mockChromeProbingViewAfterOVProbing = RequestMock()
  .onRequestTo(/\/idp\/idx\/introspect/)
  .respond(identifyWithDeviceProbingLoopback)
  .onRequestTo(/\/idp\/idx\/authenticators\/poll/)
  .respond((req, res) => {
    res.statusCode = '200';
    res.headers['content-type'] = 'application/json';
    res.setBody(deviceProbingChromeDTC);
  });

const mockChromeProbingThenIdentify = RequestMock()
  .onRequestTo(/\/idp\/idx\/introspect/)
  .respond((req, res) => {
    res.statusCode = '200';
    res.headers['content-type'] = 'application/json';
    res.setBody(deviceProbingChromeDTC);
  })
  .onRequestTo(/\/idp\/idx\/authenticators\/poll/)
  .respond((req, res) => {
    res.statusCode = '200';
    res.headers['content-type'] = 'application/json';
    res.setBody(identify);
  });

const mockChromeProbingThenCancel = RequestMock()
  .onRequestTo(/\/idp\/idx\/introspect/)
  .respond((req, res) => {
    res.statusCode = '200';
    res.headers['content-type'] = 'application/json';
    res.setBody(deviceProbingChromeDTC);
  })
  .onRequestTo(/\/idp\/idx\/authenticators\/poll/)
  .respond((req, res) => {
    res.statusCode = '200';
    res.headers['content-type'] = 'application/json';
    res.setBody(identify);
  })
  .onRequestTo(/\/idp\/idx\/authenticators\/poll\/cancel/)
  .respond((req, res) => {
    res.statusCode = '200';
    res.headers['content-type'] = 'application/json';
    res.setBody(identify);
  });

fixture('Device Challenge Polling View for Chrome DTC');

async function setup(t) {
  const deviceChallengePollPage = new DeviceChallengePollPageObject(t);
  await deviceChallengePollPage.navigateToPage();
  return deviceChallengePollPage;
}

async function setupIdentify(t) {
  const identityPage = new IdentityPageObject(t);
  await identityPage.navigateToPage();
  return identityPage;
}

test.requestHooks(mockChromeProbingView)('start Chrome DTC probing and show the view after introspect', async t => {
  assertChromeDTCView(t);
});

test.requestHooks(mockChromeProbingViewAfterOVProbing)('start Chrome DTC probing and show the view after OV probing', async t => {
  assertChromeDTCView(t);
});

test.requestHooks(mockChromeProbingThenIdentify)('start Chrome DTC probing and show the view after introspect, then authenticators/poll finishes probing and shows identify form', async t => {
  assertIdentifyChromeDTCProbing(t);
});

test.requestHooks(mockChromeProbingThenCancel)('start Chrome DTC probing and show the view after introspect, then authenticators/poll/cancel cancels probing and shows identify form', async t => {
  assertIdentifyChromeDTCProbing(t);
});


async function assertChromeDTCView(t) {
  const deviceChallengePollPageObject = await setup(t);
  await checkA11y(t);
  await t.expect(deviceChallengePollPageObject.getHeader()).eql('Collecting device signals');
  await t.expect(deviceChallengePollPageObject.getFooterCancelPollingLink().innerText).eql('Cancel and take me to sign in');
  await t.expect(deviceChallengePollPageObject.getFooterCancelPollingLink().length).eql(0);
  await t.expect(deviceChallengePollPageObject.getFooterSignOutLink().length).eql(0);
  await t.expect(deviceChallengePollPageObject.getSpinner().getStyleProperty('display')).eql('block');
  let iframe = await deviceChallengePollPageObject.getIframe();
  let attributes = await deviceChallengePollPageObject.getChromeDTCIframeAttributes();
  await t.expect(attributes.src).eql('http://localhost:3000/idp/device/dinkm9q0dV4tsEdkz0g4/challenge?transactionHandle=dit2ChhQiZ7xRpQfED8H9hXnw1NrKcE8VCq');
  await t.expect(iframe.visible).eql(false);
}

async function assertIdentifyChromeDTCProbing(t) {
  const identityPageObject = await setupIdentify(t);
  await checkA11y(t);
  await t.expect(identityPageObject.getPageTitle()).eql('Sign In');
  await t.expect(identityPageObject.getRememberMeValue()).eql(false);
}

