import { RequestLogger, RequestMock } from 'testcafe';
import DeviceChallengePollPageObject from '../framework/page-objects/DeviceChallengePollPageObject';
import identifyWithDeviceProbingLoopback from '../../../playground/mocks/data/idp/idx/identify-with-device-probing-loopback';
import error from '../../../playground/mocks/data/idp/idx/error-email-verify';

const logger = RequestLogger(/introspect|probe|challenge/, { logRequestBody: true, stringifyRequestBody: true });

const mock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(identifyWithDeviceProbingLoopback)
  .onRequestTo('http://localhost:3000/idp/idx/authenticators/poll')
  .respond((req, res) => {
    res.statusCode = '403';
    res.setBody(error);
  })
  .onRequestTo('http://localhost:2000/probe')
  .respond(null, 200, { 'access-control-allow-origin': '*' })
  .onRequestTo('http://localhost:6511/probe')
  .respond(null, 500, { 'access-control-allow-origin': '*' })
  .onRequestTo('http://localhost:6512/probe')
  .respond(null, 500, { 'access-control-allow-origin': '*' })
  .onRequestTo('http://localhost:6513/probe')
  .respond(null, 500, { 'access-control-allow-origin': '*' })
  .onRequestTo('http://localhost:2000/challenge')
  .respond(null, 200, {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'Origin, X-Requested-With, Content-Type, Accept',
    'access-control-allow-methods': 'POST, OPTIONS'
  });

fixture(`Device Challenge Polling View with Polling Failure`)
  .requestHooks(logger, mock);

async function setup(t) {
  const deviceChallengePollPage = new DeviceChallengePollPageObject(t);
  await deviceChallengePollPage.navigateToPage();
  return deviceChallengePollPage;
}

test(`probing and polling APIs are sent and responded`, async t => {
    const deviceChallengePollPageObject = await setup(t);
    await t.expect(deviceChallengePollPageObject.getHeader()).eql('Signing in using Okta FastPass');
    await t.expect(deviceChallengePollPageObject.getSpinner().getStyleProperty('display')).eql('block');
    await t.expect(logger.count(
      record => record.response.statusCode === 200 &&
      record.request.url.match(/introspect|2000/)
    )).eql(3);
    await t.expect(logger.count(
      record => record.response.statusCode === 200 &&
      record.request.url.match(/challenge/) &&
      record.request.body.match(/challengeRequest":"eyJraWQiOiI1/)
    )).eql(1);
    await t.expect(logger.contains(record => record.request.url.match(/6511|6512|6513/))).eql(false);
    await t.expect(deviceChallengePollPageObject.form.getErrorBoxText()).eql('Authentication failed');
    await t.expect(deviceChallengePollPageObject.getSpinner().getStyleProperty('display')).eql('none');
  });