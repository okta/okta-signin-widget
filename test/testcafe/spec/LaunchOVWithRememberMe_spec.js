import { RequestLogger, RequestMock } from 'testcafe';
import { checkA11y } from '../framework/a11y';
import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import loopbackChallengeNotReceived from '../../../playground/mocks/data/idp/idx/identify-with-device-probing-loopback-challenge-not-received-with-remember-me';
import launchAuthenticatorOption from '../../../playground/mocks/data/idp/idx/identify-with-device-launch-authenticator';

const logger = RequestLogger('http://localhost:3000/idp/idx/authenticators/okta-verify/launch', {logRequestBody: true, stringifyRequestBody: true});

const mock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(loopbackChallengeNotReceived)
  .onRequestTo('http://localhost:3000/idp/idx/authenticators/okta-verify/launch')
  .respond(launchAuthenticatorOption);

fixture('Launch OV with rememberMe')
  .requestHooks(logger, mock);


async function setup(t) {
  const identityPage = new IdentityPageObject(t);
  await identityPage.navigateToPage();
  await t.expect(identityPage.formExists()).ok();
  return identityPage;
}

//same for CU, AL and UL
test('check rememberMe value', async t => {
  const identityPage = await setup(t);
  await checkA11y(t);
  await identityPage.checkRememberMe();
  await identityPage.clickOktaVerifyButton();
  await t.expect(logger.requests[0].request.body.toString().includes('"rememberMe":true')).eql(true);
});

test('check no rememberMe value', async t => {
  const identityPage = await setup(t);
  await checkA11y(t);
  await identityPage.clickOktaVerifyButton();
  await t.expect(logger.requests[0].request.body.toString().includes('"rememberMe"')).eql(false); //in this case, rememberMe doesn't exists in request body
});
