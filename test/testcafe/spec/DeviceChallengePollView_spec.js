import { RequestLogger, RequestMock, Selector } from 'testcafe';
import DeviceChallengePollPageObject from '../framework/page-objects/DeviceChallengePollPageObject';
import identifyWithDeviceProbingLoopback from '../../../playground/mocks/idp/idx/data/identify-with-device-probing-loopback';
import loopbackChallengeNotReceived from '../../../playground/mocks/idp/idx/data/identify-with-device-probing-loopback-challenge-not-received';

const logger = RequestLogger([
  'http://localhost:3000/idp/idx/introspect',
  'https://localhost:3000/probe2000',
  'https://localhost:3000/probe6511',
  'https://localhost:3000/probe6512',
  'https://localhost:3000/probe6513',
  'https://localhost:3000/challenge2000',
  'https://localhost:3000/challenge6511',
  'https://localhost:3000/challenge6512',
  'https://localhost:3000/challenge6513',
]);

let failureCount = 0;
const mock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(identifyWithDeviceProbingLoopback)
  .onRequestTo('http://localhost:3000/idp/idx/authenticators/poll')
  .respond((req, res) => {
    res.statusCode = '200';
    if (failureCount === 2) {
      res.setBody(loopbackChallengeNotReceived);
    } else {
      res.setBody(identifyWithDeviceProbingLoopback);
    }
  })
  .onRequestTo('https://localhost:3000/probe2000')
  .respond(null, 500, { 'access-control-allow-origin': '*' })
  .onRequestTo('https://localhost:3000/probe6511')
  .respond(null, 500, { 'access-control-allow-origin': '*' })
  .onRequestTo('https://localhost:3000/probe6512')
  .respond(null, 200, { 'access-control-allow-origin': '*' })
  .onRequestTo('https://localhost:3000/challenge6512')
  .respond(null, 200, { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'Origin, X-Requested-With, Content-Type, Accept', 'access-control-allow-methods': 'POST, OPTIONS' })

fixture(`Device Challenge Polling View`)
  .requestHooks(logger, mock)

async function setup(t) {
  const deviceChallengePollPage = new DeviceChallengePollPageObject(t);
  await deviceChallengePollPage.navigateToPage();
  return deviceChallengePollPage;
}

test
  (`probing and polling APIs are sent and responded`, async t => {
    await setup(t);
    await t.expect(logger.count(record => record.response.statusCode === 200)).eql(3);
    failureCount = 2;
    await t.expect(logger.count(record => record.response.statusCode === 500)).eql(2);
    const form =new Selector('.o-form').nth(0);
    await t.expect(form.find('input[name="identifier"]').exists).eql(true);
  })