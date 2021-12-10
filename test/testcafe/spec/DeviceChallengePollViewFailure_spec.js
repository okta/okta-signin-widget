import { RequestLogger, RequestMock } from 'testcafe';
import DeviceChallengePollPageObject from '../framework/page-objects/DeviceChallengePollPageObject';
import identifyWithDeviceProbingLoopback from '../../../playground/mocks/data/idp/idx/identify-with-device-probing-loopback';
import error from '../../../playground/mocks/data/idp/idx/error-403-access-denied';
import errorDeviceInvalid from '../../../playground/mocks/data/idp/idx/error-poll-400-device-account-invalid';
import { a11yCheck, Constants } from '../framework/shared';

const logger = RequestLogger(/introspect|probe|challenge/, { logRequestBody: true, stringifyRequestBody: true });

const mock = RequestMock()
  .onRequestTo(/\/idp\/idx\/introspect/)
  .respond(identifyWithDeviceProbingLoopback)
  .onRequestTo(/\/idp\/idx\/authenticators\/poll/)
  .respond((req, res) => {
    return new Promise((resolve) => setTimeout(function() {
      res.statusCode = '403';
      res.setBody(error);
      resolve(res);
    }, Constants.TESTCAFE_DEFAULT_AJAX_WAIT + 2000));
  })
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

const deviceInvalidatedErrorMsg = RequestMock()
  .onRequestTo(/\/idp\/idx\/introspect/)
  .respond(identifyWithDeviceProbingLoopback)
  .onRequestTo(/\/idp\/idx\/authenticators\/poll/)
  .respond((req, res) => {
    return new Promise((resolve) => setTimeout(function() {
      res.statusCode = '400';
      res.setBody(errorDeviceInvalid);
      resolve(res);
    }, Constants.TESTCAFE_DEFAULT_AJAX_WAIT + 2000));
  })
  .onRequestTo(/2000\/probe/)
  .respond(null, 200, {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'X-Okta-Xsrftoken, Content-Type'
  })
  .onRequestTo(/6511|6512|6513\/probe/)
  .respond(null, 200, {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'X-Okta-Xsrftoken, Content-Type'
  })
  .onRequestTo(/2000\/challenge/)
  .respond(null, 200, {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'Origin, X-Requested-With, Content-Type, Accept, X-Okta-Xsrftoken',
    'access-control-allow-methods': 'POST, OPTIONS'
  });

fixture('Device Challenge Polling View with Polling Failure');

async function setup(t) {
  const deviceChallengePollPage = new DeviceChallengePollPageObject(t);
  await deviceChallengePollPage.navigateToPage();
  await a11yCheck(t);
  return deviceChallengePollPage;
}

test.requestHooks(logger, mock)('probing and polling APIs are sent and responded', async t => {
  const deviceChallengePollPageObject = await setup(t);
  await t.expect(deviceChallengePollPageObject.getHeader()).eql('Verifying your identity');
  await t.expect(deviceChallengePollPageObject.getFooterCancelPollingLink().innerText).eql('Cancel and take me to sign in');
  await t.expect(deviceChallengePollPageObject.getFooterSignOutLink().length).eql(0);
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
  await t.expect(deviceChallengePollPageObject.form.getErrorBoxText()).eql('You do not have permission to perform the requested action');
  await t.expect(deviceChallengePollPageObject.getSpinner().getStyleProperty('display')).eql('none');
  await t.expect(deviceChallengePollPageObject.getFooterSignOutLink().innerText).eql('Take me to sign in');
  await t.expect(deviceChallengePollPageObject.getFooterCancelPollingLink().length).eql(0);
});

test
  .requestHooks(logger, deviceInvalidatedErrorMsg)('add title when device or account is invalidated', async t => {
    const deviceChallengePollPageObject = await setup(t);
    await t.expect(deviceChallengePollPageObject.form.getErrorBoxText()).eql(
      'Couldn’t verify your identity\n\nYour device or account was invalidated. If this is unexpected, contact your administrator for help.');
  });
