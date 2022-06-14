import { RequestMock } from 'testcafe';
import { checkConsoleMessages, renderWidget as rerenderWidget } from '../framework/shared';
import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import xhrWellKnownResponse from '../../../playground/mocks/data/oauth2/well-known-openid-configuration.json';
import xhrInteractResponse from '../../../playground/mocks/data/oauth2/interact.json';
import xhrIdentify from '../../../playground/mocks/data/idp/idx/identify';
import xhrAuthenticatorRequiredPassword from '../../../playground/mocks/data/idp/idx/authenticator-verification-password';
import xhrSessionExpired from '../../../playground/mocks/data/idp/idx/error-401-session-expired';


const sessionExpiresDuringPasswordChallenge = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrIdentify, 200)
  .onRequestTo('http://localhost:3000/idp/idx/identify')
  .respond(xhrAuthenticatorRequiredPassword)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(xhrSessionExpired, 401);

const sessionExpiresBackToSignIn = sessionExpiresDuringPasswordChallenge
  .onRequestTo('http://localhost:3000/idp/idx/cancel')
  .respond(xhrIdentify);

const interactionCodeFlowBaseMock = RequestMock()
  .onRequestTo('http://localhost:3000/oauth2/default/.well-known/openid-configuration')
  .respond(xhrWellKnownResponse, 200)
  .onRequestTo('http://localhost:3000/oauth2/default/v1/interact')
  .respond(xhrInteractResponse, 200)
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrIdentify, 200)
  .onRequestTo('http://localhost:3000/idp/idx/identify')
  .respond(xhrAuthenticatorRequiredPassword)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(xhrSessionExpired, 401);

fixture('IDX Session Expired');

async function setup(t) {
  const identityPage = new IdentityPageObject(t);
  await identityPage.navigateToPage();
  await checkConsoleMessages({
    controller: 'primary-auth',
    formName: 'identify',
  });
  return identityPage;
}

async function setupInteractionCodeFlow(t) {
  const identityPage = new IdentityPageObject(t);
  await identityPage.navigateToPage({ render: false });

  // Render the widget for interaction code flow
  await identityPage.mockCrypto();
  await rerenderWidget({
    stateToken: undefined,
    clientId: 'fake',
    redirectUri: 'http://doesnot-matter',
    authParams: {
      pkce: true,
      state: 'mock-state'
    }
  });
  return identityPage;
}

test.requestHooks(sessionExpiresDuringPasswordChallenge)('reloads into fresh state after session expires when challenging password', async t => {
  const identityPage = await setup(t);

  await identityPage.fillIdentifierField('Test Identifier');
  await identityPage.clickNextButton();

  await identityPage.fillPasswordField('credentials.passcode', 'test');
  await identityPage.clickNextButton();

  await t.expect(identityPage.getGlobalErrors()).eql('You have been logged out due to inactivity. Refresh or return to the sign in screen.');
  await t.expect(identityPage.getSignoutLinkText()).eql('Back to sign in'); // confirm they can get out of terminal state
  await t.expect(identityPage.getIdentifier()).eql('testUser@okta.com');

  await identityPage.refresh();

  // ensure SIW does not load with the SessionExpired error
  await t.expect(identityPage.getPageTitle()).eql('Sign In');
  await t.expect(identityPage.getTotalGlobalErrors()).eql(0);
});

test.requestHooks(sessionExpiresBackToSignIn)('back to sign loads identify after session expires when challenging password', async t => {
  const identityPage = await setup(t);

  await identityPage.fillIdentifierField('Test Identifier');
  await identityPage.clickNextButton();

  await identityPage.fillPasswordField('credentials.passcode', 'test');
  await identityPage.clickNextButton();

  await t.expect(identityPage.getGlobalErrors()).eql('You have been logged out due to inactivity. Refresh or return to the sign in screen.');
  await t.expect(identityPage.getSignoutLinkText()).eql('Back to sign in'); // confirm they can get out of terminal state
  await t.expect(identityPage.getIdentifier()).eql('testUser@okta.com');

  await identityPage.clickSignOutLink();

  // ensure SIW does not load with the SessionExpired error
  await t.expect(identityPage.getPageTitle()).eql('Sign In');
  await t.expect(identityPage.getTotalGlobalErrors()).eql(0);
});

test.requestHooks(interactionCodeFlowBaseMock)('Int. Code Flow: reloads into fresh state after after session expires when challenging password', async t => {
  let identityPage = await setupInteractionCodeFlow(t);

  await identityPage.fillIdentifierField('Test Identifier');
  await identityPage.clickNextButton();

  await identityPage.fillPasswordField('credentials.passcode', 'test');
  await identityPage.clickNextButton();

  await t.expect(identityPage.getGlobalErrors()).eql('You have been logged out due to inactivity. Refresh or return to the sign in screen.');
  await t.expect(identityPage.getSignoutLinkText()).eql('Back to sign in'); // confirm they can get out of terminal state
  await t.expect(identityPage.getIdentifier()).eql('testUser@okta.com');

  await identityPage.refresh();
  identityPage = await setupInteractionCodeFlow(t);

  // ensure SIW does not load with the SessionExpired error
  await t.expect(identityPage.getPageTitle()).eql('Sign In');
  await t.expect(identityPage.getTotalGlobalErrors()).eql(0);
});

test.requestHooks(interactionCodeFlowBaseMock)('Int. Code Flow: back to sign loads identify after session expires when challenging password', async t => {
  const identityPage = await setupInteractionCodeFlow(t);

  await identityPage.fillIdentifierField('Test Identifier');
  await identityPage.clickNextButton();

  await identityPage.fillPasswordField('credentials.passcode', 'test');
  await identityPage.clickNextButton();

  await t.expect(identityPage.getGlobalErrors()).eql('You have been logged out due to inactivity. Refresh or return to the sign in screen.');
  await t.expect(identityPage.getSignoutLinkText()).eql('Back to sign in'); // confirm they can get out of terminal state
  await t.expect(identityPage.getIdentifier()).eql('testUser@okta.com');

  await identityPage.clickSignOutLink();

  // ensure SIW does not load with the SessionExpired error
  await t.expect(identityPage.getPageTitle()).eql('Sign In');
  await t.expect(identityPage.getTotalGlobalErrors()).eql(0);
});