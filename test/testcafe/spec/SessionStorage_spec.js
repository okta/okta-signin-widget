import { ClientFunction, RequestLogger, RequestMock } from 'testcafe';
import xhrEmailVerification from '../../../playground/mocks/data/idp/idx/authenticator-verification-email';
import xhrSessionExpried from '../../../playground/mocks/data/idp/idx/error-session-expired';
import xhrIdentify from '../../../playground/mocks/data/idp/idx/identify';
import xhrSuccess from '../../../playground/mocks/data/idp/idx/success';
import xhrSuccessWithInteractionCode from '../../../playground/mocks/data/idp/idx/success-with-interaction-code';
import xhrSuccessTokens from '../../../playground/mocks/data/oauth2/success-tokens';
import xhrMagicLinkExpired from '../../../playground/mocks/data/idp/idx/terminal-return-expired-email';
import xhrIdentifyWithNoAppleCredentialSSOExtension from '../../../playground/mocks/data/idp/idx/identify-with-no-sso-extension';
import ChallengeEmailPageObject from '../framework/page-objects/ChallengeEmailPageObject';
import BasePageObject from '../framework/page-objects/BasePageObject';
import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import SuccessPageObject from '../framework/page-objects/SuccessPageObject';
import TerminalPageObject from '../framework/page-objects/TerminalPageObject';
import { getStateHandleFromSessionStorage, renderWidget, checkConsoleMessages } from '../framework/shared';

const identifyChallengeMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrIdentify)
  .onRequestTo('http://localhost:3000/idp/idx/identify')
  .respond(xhrEmailVerification)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(xhrEmailVerification)
  .onRequestTo('http://localhost:3000/idp/idx/cancel')
  .respond(xhrIdentify);

const introspectRequestLogger = RequestLogger(
  /idx\/introspect/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
  }
);

const credentialSSONotExistMock = RequestMock()
  .onRequestTo(/idp\/idx\/introspect/)
  .respond(xhrIdentifyWithNoAppleCredentialSSOExtension)
  .onRequestTo(/idp\/idx\/authenticators\/sso_extension\/transactions\/456\/verify\/cancel/)
  .respond(xhrIdentify);

const credentialSSONotExistLogger = RequestLogger(/introspect|verify\/cancel/);

fixture('Session Storage - manage state in client side')
  .afterEach(() => {
    ClientFunction(() => { window.sessionStorage.clear(); });
  });

test.requestHooks(identifyChallengeMock)('shall save state handle during authenticator and clear after success', async t => {
  const challengeSuccessMock = RequestMock()
    .onRequestTo('http://localhost:3000/idp/idx/introspect')
    .respond(xhrEmailVerification)
    .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
    .respond(xhrSuccess);

  const identityPage = new IdentityPageObject(t);
  const challengeEmailPageObject = new ChallengeEmailPageObject(t);
  const successPage = new SuccessPageObject(t);

  // Identify page
  await identityPage.navigateToPage();
  await t.expect(getStateHandleFromSessionStorage()).eql(null);
  await identityPage.fillIdentifierField('foo@test.com');
  await identityPage.clickNextButton();

  // Email challenge page
  const pageTitle = challengeEmailPageObject.form.getTitle();
  await t.expect(pageTitle).eql('Verify with your email');
  await t.expect(getStateHandleFromSessionStorage()).eql(xhrEmailVerification.stateHandle);

  // Reset the mock
  // This is actually very weak assertion because even widget
  // doesn't save state handle and we reset mock during test,
  // test still pass. Meaning the mock server could response emailVerify
  // even a new state handle but unlikely from a actual server.
  await t.removeRequestHooks(identifyChallengeMock);
  await t.addRequestHooks(challengeSuccessMock);

  // Refresh shall stay at same page
  await challengeEmailPageObject.refresh();
  const pageTitleAfterRefresh = challengeEmailPageObject.form.getTitle();
  await t.expect(pageTitleAfterRefresh).eql('Verify with your email');
  await t.expect(getStateHandleFromSessionStorage()).eql(xhrEmailVerification.stateHandle);

  // Verify
  await challengeEmailPageObject.verifyFactor('credentials.passcode', '1234');
  await challengeEmailPageObject.clickNextButton();

  // Success page
  const pageUrl = await successPage.getPageUrl();
  await t.expect(pageUrl)
    .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
  await t.expect(getStateHandleFromSessionStorage()).eql(null);
});

test.requestHooks(identifyChallengeMock)('shall save state handle during authenticator and do not clear at terminal', async t => {
  const challengeTerminalMock = RequestMock()
    .onRequestTo('http://localhost:3000/idp/idx/introspect')
    .respond(xhrEmailVerification)
    .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
    .respond(xhrMagicLinkExpired);

  const identityPage = new IdentityPageObject(t);
  const challengeEmailPageObject = new ChallengeEmailPageObject(t);
  const terminalPageObject = new TerminalPageObject(t);

  // Identify page
  await identityPage.navigateToPage();
  await t.expect(getStateHandleFromSessionStorage()).eql(null);
  await identityPage.fillIdentifierField('foo@test.com');
  await identityPage.clickNextButton();

  // Email challenge page
  const pageTitle = challengeEmailPageObject.form.getTitle();
  await t.expect(pageTitle).eql('Verify with your email');
  await t.expect(getStateHandleFromSessionStorage()).eql(xhrEmailVerification.stateHandle);
  await challengeEmailPageObject.verifyFactor('credentials.passcode', '1234');
  await challengeEmailPageObject.clickNextButton();

  // Reset mocks
  await t.removeRequestHooks(identifyChallengeMock);
  await t.addRequestHooks(challengeTerminalMock);

  // Refresh shall stay at same page
  await challengeEmailPageObject.refresh();
  const pageTitleAfterRefresh = challengeEmailPageObject.form.getTitle();
  await t.expect(pageTitleAfterRefresh).eql('Verify with your email');
  await t.expect(getStateHandleFromSessionStorage()).eql(xhrEmailVerification.stateHandle);

  // Verify
  await challengeEmailPageObject.verifyFactor('credentials.passcode', '1234');
  await challengeEmailPageObject.clickNextButton();

  // Terminal page
  await t.expect(terminalPageObject.form.getTitle()).eql('Verify with your email');
  await t.expect(terminalPageObject.getErrorMessages().isError()).eql(true);
  await t.expect(terminalPageObject.getErrorMessages().getTextContent()).eql('This email link has expired. To resend it, return to the screen where you requested it.');
  // TODO: OKTA-392835 shall not clear state handle at terminal page
  await t.expect(getStateHandleFromSessionStorage()).eql(null);
});

test.requestHooks(identifyChallengeMock)('shall clear session.stateHandle when click sign-out', async t => {
  const identityPage = new IdentityPageObject(t);
  const challengeEmailPageObject = new ChallengeEmailPageObject(t);

  // Identify page
  await identityPage.navigateToPage();
  await t.expect(getStateHandleFromSessionStorage()).eql(null);
  await identityPage.fillIdentifierField('foo@test.com');
  await identityPage.clickNextButton();

  // Email challenge page
  const pageTitle = challengeEmailPageObject.form.getTitle();
  await t.expect(pageTitle).eql('Verify with your email');
  await t.expect(getStateHandleFromSessionStorage()).eql(xhrEmailVerification.stateHandle);
  await challengeEmailPageObject.clickSignOutLink();

  // Go back to Identify page after sign-out
  await t.expect(identityPage.form.getTitle()).eql('Sign In');
  await t.expect(getStateHandleFromSessionStorage()).eql(null);
});

test.requestHooks(identifyChallengeMock)('shall clear when session.stateHandle is invalid', async t => {
  let useNewTokenResponse = false;
  const multipleIntrospectMock = RequestMock()
    .onRequestTo('http://localhost:3000/idp/idx/introspect')
    .respond((req, res) => {
      if (useNewTokenResponse) {
        // mimic response for new token
        res.statusCode = '200';
        res.setBody(xhrIdentify);
      } else {
        // mimic invalid token response
        res.statusCode = '401';
        res.setBody(xhrSessionExpried);
        useNewTokenResponse = true;
      }
    });
  const identityPage = new IdentityPageObject(t);
  const challengeEmailPageObject = new ChallengeEmailPageObject(t);

  // Identify page
  await identityPage.navigateToPage();
  await t.expect(getStateHandleFromSessionStorage()).eql(null);
  await identityPage.fillIdentifierField('foo@test.com');
  await identityPage.clickNextButton();

  // Email challenge page
  const pageTitle = challengeEmailPageObject.form.getTitle();
  await t.expect(pageTitle).eql('Verify with your email');
  await t.expect(getStateHandleFromSessionStorage()).eql(xhrEmailVerification.stateHandle);

  // Reset mocks
  await t.removeRequestHooks(identifyChallengeMock);
  await t.addRequestHooks(multipleIntrospectMock);
  await t.addRequestHooks(introspectRequestLogger);

  // Refresh
  await challengeEmailPageObject.refresh();

  // Verify introspect requests
  // introspect with session.stateHandle
  // introspect with setting.stateHandle (from .widgetrc)
  await t.expect(introspectRequestLogger.count(() => true)).eql(2);

  const req1 = introspectRequestLogger.requests[0].request;
  const reqBody1 = JSON.parse(req1.body);
  await t.expect(reqBody1).eql({
    stateToken: '02WTSGqlHUPjoYvorz8T48txBIPe3VUisrQOY4g5N8',
  });
  await t.expect(req1.url).eql('http://localhost:3000/idp/idx/introspect');

  const req2 = introspectRequestLogger.requests[1].request;
  const reqBody2 = JSON.parse(req2.body);
  await t.expect(reqBody2).eql({
    stateToken: 'dummy-state-token-wrc',
  });
  await t.expect(req2.url).eql('http://localhost:3000/idp/idx/introspect');

  // Go back to Identify page as saved state handle becomes invalid
  // and new state handle responds identify
  await t.expect(identityPage.form.getTitle()).eql('Sign In');
  await t.expect(getStateHandleFromSessionStorage()).eql(null);
});


test.requestHooks(introspectRequestLogger, identifyChallengeMock)('shall clear session.stateHandle when URL changes to handle changing apps', async t => {
  const identityPage = new IdentityPageObject(t);
  const challengeEmailPageObject = new ChallengeEmailPageObject(t);

  // Identify page
  await identityPage.navigateToPage();
  await t.expect(getStateHandleFromSessionStorage()).eql(null);
  await identityPage.fillIdentifierField('foo@test.com');
  await identityPage.clickNextButton();

  // Email challenge page
  const pageTitle = challengeEmailPageObject.form.getTitle();
  await t.expect(pageTitle).eql('Verify with your email');
  await t.expect(getStateHandleFromSessionStorage()).eql(xhrEmailVerification.stateHandle);

  // Change apps
  await t.navigateTo('/app/phpsaml/123/sso/saml');

  // Verify introspect requests, one for each app visit
  await t.expect(introspectRequestLogger.count(() => true)).eql(2);

  // Go back to Identify page as saved state handle becomes invalid
  // and new state handle responds identify
  await t.expect(identityPage.form.getTitle()).eql('Sign In');
  await t.expect(getStateHandleFromSessionStorage()).eql(null);
});

test.requestHooks(credentialSSONotExistLogger, credentialSSONotExistMock)('shall clear session.stateHandle when SSO extension fails', async t => {
  const ssoExtensionPage = new BasePageObject(t);
  await ssoExtensionPage.navigateToPage();
  await t.expect(credentialSSONotExistLogger.count(
    record => record.response.statusCode === 200 &&
      record.request.url.match(/introspect/)
  )).eql(1);
  await t.expect(credentialSSONotExistLogger.count(
    record => record.response.statusCode === 200 &&
      record.request.url.match(/456\/verify\/cancel/)
  )).eql(1);
  await t.expect(getStateHandleFromSessionStorage()).eql(null);
});

test.requestHooks(identifyChallengeMock)('shall back to sign-in and authenticate successfully', async t => {
  const identityPage = new IdentityPageObject(t);
  const challengeEmailPageObject = new ChallengeEmailPageObject(t);
  let pageTitle;

  // Add mocks for interaction code flow
  const challengeSuccessMock = RequestMock()
    .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
    .respond(xhrSuccessWithInteractionCode)
    .onRequestTo('http://localhost:3000/oauth2/default/v1/token')
    .respond(xhrSuccessTokens);
  await t.addRequestHooks(challengeSuccessMock);

  // Setup widget with interaction code flow
  const optionsForInteractionCodeFlow = {
    clientId: 'fake',
    useInteractionCodeFlow: true,
    authParams: {
      ignoreSignature: true,
      pkce: true,
    },
    stateToken: undefined
  };
  await identityPage.navigateToPage({ render: false });
  await identityPage.mockCrypto();
  await t.setNativeDialogHandler(() => true);
  await renderWidget(optionsForInteractionCodeFlow);

  // Identify page
  await identityPage.fillIdentifierField('foo@test.com');
  await identityPage.clickNextButton();

  // Email challenge page - click 'Back to sign-in'
  pageTitle = challengeEmailPageObject.form.getTitle();
  await t.expect(pageTitle).eql('Verify with your email');
  await challengeEmailPageObject.clickSignOutLink();

  // Go back to Identify page
  pageTitle = identityPage.form.getTitle();
  await t.expect(pageTitle).eql('Sign In');
  await identityPage.fillIdentifierField('foo@test.com');
  await identityPage.clickNextButton();

  // Email challenge page - verify
  pageTitle = challengeEmailPageObject.form.getTitle();
  await t.expect(pageTitle).eql('Verify with your email');
  await challengeEmailPageObject.verifyFactor('credentials.passcode', '1234');
  await challengeEmailPageObject.clickNextButton();
  
  // Check success
  await checkConsoleMessages([
    'ready',
    'afterRender',
    {
      controller: 'primary-auth',
      formName: 'identify'
    },
    'afterRender',
    {
      controller: 'mfa-verify-passcode',
      formName: 'challenge-authenticator',
      authenticatorKey: 'okta_email',
      methodType: 'email'
    },
    'afterRender',
    {
      controller: 'primary-auth',
      formName: 'identify'
    },
    'afterRender',
    {
      controller: 'primary-auth',
      formName: 'identify'
    },
    'afterRender',
    {
      controller: 'mfa-verify-passcode',
      formName: 'challenge-authenticator',
      authenticatorKey: 'okta_email',
      methodType: 'email'
    },
    {
      status: 'SUCCESS',
      accessToken: xhrSuccessTokens.access_token,
      idToken: xhrSuccessTokens.id_token
    }
  ]);
});