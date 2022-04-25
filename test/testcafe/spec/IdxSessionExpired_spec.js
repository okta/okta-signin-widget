// TODO:
// mocks: 
//      interact - 200
//      introspect - 200
//      identify - 200 
//      challenage-authenticator (password) - 401 idx.session.expired
//      cancel - 200

import { RequestMock, RequestLogger, ClientFunction } from 'testcafe';
import { checkConsoleMessages, renderWidget as rerenderWidget } from '../framework/shared';
import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import ChallengePasswordPageObject from '../framework/page-objects/ChallengePasswordPageObject';
import xhrWellKnownResponse from '../../../playground/mocks/data/oauth2/well-known-openid-configuration.json';
import xhrInteractResponse from '../../../playground/mocks/data/oauth2/interact.json';
import xhrIdentify from '../../../playground/mocks/data/idp/idx/identify';
import xhrAuthenticatorRequiredPassword from '../../../playground/mocks/data/idp/idx/authenticator-verification-password';
import xhrSessionExpired from '../../../playground/mocks/data/idp/idx/error-401-session-expired';


const sessionExpiresMidFlowMock = RequestMock()
  .onRequestTo('http://localhost:3000/oauth2/default/.well-known/openid-configuration')
  .respond(xhrWellKnownResponse, 200)
  .onRequestTo('http://localhost:3000/oauth2/default/v1/interact')
  .respond(xhrInteractResponse, 200)
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrIdentify)
  .onRequestTo('http://localhost:3000/idp/idx/identify')
  .respond(xhrAuthenticatorRequiredPassword)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(xhrSessionExpired, 401);

const sessionExpiredOnLoadMock = RequestMock()
  .onRequestTo('http://localhost:3000/oauth2/default/.well-known/openid-configuration')
  .respond(xhrWellKnownResponse, 200)
  .onRequestTo('http://localhost:3000/oauth2/default/v1/interact')
  .respond(xhrInteractResponse, 200)
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrSessionExpired, 401);

const sessionExpiresDuringPassword = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorRequiredPassword)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(xhrSessionExpired, 401);

const identifyRequestLogger = RequestLogger(
  /idx\/identify|\/challenge/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
    logRequestHeaders: true,
  }
);

fixture('IDX Session Expired');

async function setup(t) {
  const identityPage = new IdentityPageObject(t);
  await identityPage.navigateToPage();
  // await checkConsoleMessages({
  //   controller: 'primary-auth',
  //   formName: 'identify',
  // });

  return identityPage;
}

test.requestHooks(identifyRequestLogger, sessionExpiresDuringPassword)('session expires when challenging password', async t => {
  // setup
  const challengePasswordPage = new ChallengePasswordPageObject(t);
  await challengePasswordPage.navigateToPage();

  await challengePasswordPage.verifyFactor('credentials.passcode', 'test');
  await challengePasswordPage.clickNextButton();

  await t.expect(challengePasswordPage.getErrorFromErrorBox()).eql('You have been logged out due to inactivity. Refresh or return to the sign in screen.');
  await t.expect(challengePasswordPage.getSignoutLinkText()).eql('Back to sign in'); // confirm they can get out of terminal state
  await t.expect(challengePasswordPage.getIdentifier()).eql('testUser@okta.com');
});