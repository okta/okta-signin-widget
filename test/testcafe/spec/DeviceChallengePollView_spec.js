import { RequestLogger, RequestMock } from 'testcafe';
import DeviceChallengePollPageObject from '../framework/page-objects/DeviceChallengePollPageObject';
import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import identify from '../../../playground/mocks/idp/idx/data/identify';
import identifyWithDeviceProbingLoopback from '../../../playground/mocks/idp/idx/data/identify-with-device-probing-loopback';

let failureCount = 0;

const logger = RequestLogger(/introspect|probe|challenge/, { logRequestBody: true, stringifyRequestBody: true });

const mock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(identifyWithDeviceProbingLoopback)
  .onRequestTo('http://localhost:3000/idp/idx/authenticators/poll')
  .respond((req, res) => {
    res.statusCode = '200';
    if (failureCount === 2) {
      res.setBody(identify);
    } else {
      res.setBody(identifyWithDeviceProbingLoopback);
    }
  })
  .onRequestTo('http://localhost:2000/probe')
  .respond(null, 500, { 'access-control-allow-origin': '*' })
  .onRequestTo('http://localhost:6511/probe')
  .respond(null, 500, { 'access-control-allow-origin': '*' })
  .onRequestTo('http://localhost:6512/probe')
  .respond(null, 200, { 'access-control-allow-origin': '*' })
  .onRequestTo('http://localhost:6512/challenge')
  .respond(null, 200, {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'Origin, X-Requested-With, Content-Type, Accept',
    'access-control-allow-methods': 'POST, OPTIONS'
  })

fixture(`Device Challenge Polling View with Successful Loopback Server`)
  .requestHooks(logger, mock)

async function setup(t) {
  const deviceChallengePollPage = new DeviceChallengePollPageObject(t);
  await deviceChallengePollPage.navigateToPage();
  return deviceChallengePollPage;
}

test
  (`probing and polling APIs are sent and responded`, async t => {
    const deviceChallengePollPageObject = await setup(t);
    await t.expect(deviceChallengePollPageObject.getHeader()).eql('Sign In');
    await t.expect(logger.count(
      record => record.response.statusCode === 200 &&
      record.request.url.match(/introspect|6512/)
    )).eql(3);
    await t.expect(logger.count(
      record => record.response.statusCode === 200 &&
      record.request.url.match(/challenge/) &&
      record.request.body.match(/challengeRequest":"eyJraWQiOiI1/)
    )).eql(1);
    failureCount = 2;
    await t.expect(logger.count(
      record => record.response.statusCode === 500 &&
      record.request.url.match(/2000|6511/)
    )).eql(2);
    await t.expect(logger.contains(record => record.request.url.match(/6513/))).eql(false);

    const identityPage = new IdentityPageObject(t);
    await identityPage.fillIdentifierField('Test Identifier');
    await t.expect(identityPage.getIdentifierValue()).eql('Test Identifier');
  })