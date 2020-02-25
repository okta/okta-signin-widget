import { RequestLogger, RequestMock, ClientFunction } from 'testcafe';
import DeviceChallengePollPageObject from '../framework/page-objects/DeviceChallengePollPageObject';
import identifyWithLaunchAuthenticator from '../../../playground/mocks/idp/idx/data/identify-with-device-launch-authenticator';

const logger = RequestLogger(/introspect|probe|cancel|launch|launch-okta-verify|poll/);
const identifyWithLaunchAuthenticatorHttpCustomUri = JSON.parse(JSON.stringify(identifyWithLaunchAuthenticator));
const mockHttpCustomUri = 'http://localhost:3000/launch-okta-verify';
// replace custom URI with http URL so that we can mock and verify
identifyWithLaunchAuthenticatorHttpCustomUri.authenticatorChallenge.value.href = mockHttpCustomUri;

const mock = RequestMock()
  .onRequestTo(/idp\/idx\/introspect/)
  .respond(identifyWithLaunchAuthenticatorHttpCustomUri)
  .onRequestTo(/\/idp\/idx\/authenticators\/poll/)
  .respond(identifyWithLaunchAuthenticatorHttpCustomUri);


fixture(`Device Challenge Polling View with custom URI launches Okta Verify`);

async function setup(t) {
  const deviceChallengePollPage = new DeviceChallengePollPageObject(t);
  await deviceChallengePollPage.navigateToPage();
  return deviceChallengePollPage;
}

const getPageUrl = ClientFunction(() => window.location.href);
test
  .requestHooks(logger, mock)(`load the custom URI`, async t => {
    await setup(t);
    await t.expect(getPageUrl()).contains(mockHttpCustomUri);
  });