import { RequestLogger, RequestMock } from 'testcafe';
import { checkA11y } from '../framework/a11y';
import DeviceChallengePollPageObject from '../framework/page-objects/DeviceChallengePollPageObject';
import identifyWithDeviceProbingLoopback from '../../../playground/mocks/data/idp/idx/identify-with-device-probing-loopback';
import error from '../../../playground/mocks/data/idp/idx/error-403-access-denied';
import errorDeviceInvalid from '../../../playground/mocks/data/idp/idx/error-poll-400-device-account-invalid';
import { Constants } from '../framework/shared';

const logger = RequestLogger(/introspect|probe|challenge/, { logRequestBody: true, stringifyRequestBody: true });

const baseMock = RequestMock()
  .onRequestTo(/\/idp\/idx\/introspect/)
  .respond(identifyWithDeviceProbingLoopback)
  .onRequestTo(/2000\/probe/)
  .respond(null, 200, { 
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'X-Okta-Xsrftoken, Content-Type'
  })
  .onRequestTo(/6511|6512|6513\/probe/)
  .respond(null, 500, { 
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'X-Okta-Xsrftoken, Content-Type'
  })
  .onRequestTo(/2000\/challenge/)
  .respond(null, 200, {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'Origin, X-Requested-With, Content-Type, Accept, X-Okta-Xsrftoken',
    'access-control-allow-methods': 'POST, OPTIONS'
  });

const initialPoll = RequestMock()
  .onRequestTo(/\/idp\/idx\/authenticators\/poll/)
  .respond(identifyWithDeviceProbingLoopback);

const noPermissionErrorPoll = RequestMock()
  .onRequestTo(/\/idp\/idx\/authenticators\/poll/)
  .respond((req, res) => {
    return new Promise((resolve) => setTimeout(function() {
      res.statusCode = '403';
      res.headers['content-type'] = 'application/json';
      res.setBody(error);
      resolve(res);
    }, Constants.TESTCAFE_DEFAULT_AJAX_WAIT + 2000));
  });

const nonIdxErrorPoll = RequestMock()
  .onRequestTo(/\/idp\/idx\/authenticators\/poll/)
  .respond((req, res) => {
    return new Promise((resolve) => setTimeout(function() {
      res.statusCode = '400';
      res.headers['content-type'] = 'application/json';
      res.setBody({});
      resolve(res);
    }, Constants.TESTCAFE_DEFAULT_AJAX_WAIT + 2000));
  });

const deviceInvalidatedErrorPoll = RequestMock()
  .onRequestTo(/\/idp\/idx\/authenticators\/poll/)
  .respond((req, res) => {
    return new Promise((resolve) => setTimeout(function() {
      res.statusCode = '400';
      res.headers['content-type'] = 'application/json';
      res.setBody(errorDeviceInvalid);
      resolve(res);
    }, Constants.TESTCAFE_DEFAULT_AJAX_WAIT + 2000));
  });

fixture('Device Challenge Polling View with Polling Failure').meta('v3', true);

async function setup(t) {
  const deviceChallengePollPage = new DeviceChallengePollPageObject(t);
  await deviceChallengePollPage.navigateToPage();
  await t.expect(deviceChallengePollPage.formExists()).eql(true);
  return deviceChallengePollPage;
}

// TODO: fix quarantined test - OKTA-645716
test.skip
  .requestHooks(logger, baseMock, initialPoll)('probing and polling APIs are sent and responded', async t => {
    const deviceChallengePollPageObject = await setup(t);
    await checkA11y(t);
    await t.expect(deviceChallengePollPageObject.getFormTitle()).eql('Verifying your identity');

    await t.removeRequestHooks(initialPoll);
    await t.addRequestHooks(noPermissionErrorPoll);

    await t.expect(deviceChallengePollPageObject.getFooterCancelPollingLink().exists).eql(true);
    await t.expect(logger.count(
      record => record.response.statusCode === 200 &&
        record.request.method !== 'options' &&
        record.request.url.match(/introspect|2000/)
    )).eql(3);
    await t.expect(logger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/challenge/) &&
        record.request.body.match(/challengeRequest":"eyJraWQiOiI1/)
    )).eql(1);
    await t.expect(deviceChallengePollPageObject.getErrorBoxText()).eql('You do not have permission to perform the requested action');
    await t.expect(await deviceChallengePollPageObject.hasSpinner()).eql(false);
    await t.expect(deviceChallengePollPageObject.getFooterSignOutLink().exists).eql(true);
  });

test
  .requestHooks(logger, baseMock, initialPoll)('add title when device or account is invalidated', async t => {
    const deviceChallengePollPageObject = await setup(t);
    await checkA11y(t);
    await t.expect(deviceChallengePollPageObject.getFormTitle()).eql('Verifying your identity');

    await t.removeRequestHooks(initialPoll);
    await t.addRequestHooks(deviceInvalidatedErrorPoll);

    await t.expect(deviceChallengePollPageObject.getErrorBoxText()).contains('Couldn’t verify your identity');
    await t.expect(deviceChallengePollPageObject.getErrorBoxText()).contains(
      'Your device or account was invalidated. If this is unexpected, contact your administrator for help.');
  });

test
  .requestHooks(logger, baseMock, initialPoll)('Non IDX error', async t => {
    const deviceChallengePollPageObject = await setup(t);
    await checkA11y(t);
    await t.expect(deviceChallengePollPageObject.getFormTitle()).eql('Verifying your identity');

    await t.removeRequestHooks(initialPoll);
    await t.addRequestHooks(nonIdxErrorPoll);

    await t.expect(deviceChallengePollPageObject.getErrorBoxText()).eql(
      'There was an unsupported response from server.');
  });
