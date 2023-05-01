import { RequestMock, RequestLogger } from 'testcafe';
import { checkA11y } from '../framework/a11y';
import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import ChallengeEmailPageObject from '../framework/page-objects/ChallengeEmailPageObject';
import { renderWidget as rerenderWidget } from '../framework/shared';
import xhrIdentify from '../../../playground/mocks/data/idp/idx/identify';
import xhrIdentifyWithUsername from '../../../playground/mocks/data/idp/idx/identify-with-username';
import xhrPassword from '../../../playground/mocks/data/idp/idx/authenticator-verification-password';
import xhrSuccess from '../../../playground/mocks/data/idp/idx/success';
import xhrIdentifyWithPassword from '../../../playground/mocks/data/idp/idx/identify-with-password';
import emailVerification from '../../../playground/mocks/data/idp/idx/authenticator-verification-email';


const identifyMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrIdentify)
  .onRequestTo('http://localhost:3000/idp/idx/identify')
  .respond(xhrPassword)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(xhrSuccess);

const identifyWithUsernameMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrIdentifyWithUsername);

const identifyWithPasswordMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrIdentifyWithPassword)
  .onRequestTo('http://localhost:3000/idp/idx/identify')
  .respond(xhrSuccess);

const identifyWithEmailAuthenticator = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrIdentify)
  .onRequestTo('http://localhost:3000/idp/idx/identify')
  .respond(emailVerification)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(xhrSuccess);

const identifyRequestLogger = RequestLogger(
  /idx\/identify|\/challenge/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
    logRequestHeaders: true,
  }
);

const baseConfig = {
  features: {
    rememberMe: true,
    rememberMyUsernameOnOIE: true
  }
};

fixture('Identify With Remember Username')
  .meta('v3', true);

async function setup(t, options) {
  const identityPage = new IdentityPageObject(t);
  await identityPage.navigateToPage(options || {});
  return identityPage;
}

test.requestHooks(identifyRequestLogger, identifyMock)('identifer first flow - should remember username after successful authentication', async t => {
  const identityPage = await setup(t);
  await checkA11y(t);
  await rerenderWidget(baseConfig);

  await identityPage.fillIdentifierField('testUser@okta.com');
  await identityPage.clickNextButton();

  await identityPage.fillPasswordField('testPassword');
  await identityPage.clickVerifyButton();

  await t.expect(identifyRequestLogger.count(() => true)).eql(2);
  const req = identifyRequestLogger.requests[0].request;
  const reqBody = JSON.parse(req.body);
  await t.expect(reqBody).contains({
    identifier: 'testUser@okta.com',
  });

  // Ensure identifier field is pre-filled with saved username cookie
  await identityPage.navigateToPage();
  await rerenderWidget(baseConfig);
  const identifier = identityPage.getIdentifierValue();
  await t.expect(identifier).eql('testUser@okta.com');
});

test.requestHooks(identifyRequestLogger, identifyWithPasswordMock)('identifer with password - should remember username after successful authentication', async t => {
  const identityPage = await setup(t);
  await checkA11y(t);
  await rerenderWidget(baseConfig);

  await identityPage.fillIdentifierField('testUser@okta.com');
  await identityPage.fillPasswordField('testPassword');
  await identityPage.clickSignInButton();

  await t.expect(identifyRequestLogger.count(() => true)).eql(1);
  const req = identifyRequestLogger.requests[0].request;
  const reqBody = JSON.parse(req.body);

  await t.expect(reqBody).contains({
    identifier: 'testUser@okta.com',
  });
  await t.expect(reqBody.credentials).contains({
    passcode: 'testPassword'
  });

  // Ensure identifier field is pre-filled with saved username cookie
  await identityPage.navigateToPage();
  await rerenderWidget(baseConfig);
  const identifier = identityPage.getIdentifierValue();
  await t.expect(identifier).eql('testUser@okta.com');
});

test.requestHooks(identifyRequestLogger, identifyWithEmailAuthenticator)('identifer with email challenge - should remember username after successful authentication', async t => {
  const options = {
    features: {
      rememberMe: true,
      rememberMyUsernameOnOIE: true
    },
  };

  const identityPage = await setup(t, { render: false });
  await checkA11y(t);
  await identityPage.mockCrypto();
  await t.setNativeDialogHandler(() => true);
  await rerenderWidget(options);

  await identityPage.fillIdentifierField('testUser@okta.com');
  await identityPage.clickNextButton();

  const challengeEmailPageObject = new ChallengeEmailPageObject(t);
  await challengeEmailPageObject.clickEnterCodeLink();

  await challengeEmailPageObject.verifyFactor('credentials.passcode', '1234');
  await challengeEmailPageObject.clickVerifyButton();

  const req = identifyRequestLogger.requests[0].request;
  const reqBody = JSON.parse(req.body);
  await t.expect(reqBody).contains({
    identifier: 'testUser@okta.com',
  });

  // Ensure identifier field is pre-filled with saved username cookie
  await identityPage.navigateToPage();
  await rerenderWidget(baseConfig);
  const identifier = identityPage.getIdentifierValue();
  await t.expect(identifier).eql('testUser@okta.com'); // FIXME failing
});

test.meta('flaky', true).requestHooks(identifyRequestLogger, identifyMock)('should pre-fill identifier field with config.username passed in and feature.rememberMe enabled', async t => {
  const identityPage = await setup(t);
  await checkA11y(t);
  await rerenderWidget(baseConfig);

  // Go through authentication process to save cookie
  await identityPage.fillIdentifierField('testUser@okta.com');
  await identityPage.clickNextButton();

  await identityPage.fillPasswordField('testPassword');
  await identityPage.clickVerifyButton();

  await t.expect(identifyRequestLogger.count(() => true)).eql(2);
  const req = identifyRequestLogger.requests[0].request;
  const reqBody = JSON.parse(req.body);
  await t.expect(reqBody).contains({
    identifier: 'testUser@okta.com',
  });

  // Ensure identifier field is pre-filled with config.username passed in
  await identityPage.navigateToPage();
  await rerenderWidget({
    username: 'configUsername@okta.com',
    features: {
      rememberMe: true,
      rememberMyUsernameOnOIE: true
    }
  });

  const identifier = identityPage.getIdentifierValue();
  await t.expect(identifier).eql('configUsername@okta.com');
});

test.requestHooks(identifyRequestLogger, identifyMock)('should pre-fill identifier field with remediation identifier value over saved cookie', async t => {
  const identityPage = await setup(t);
  await checkA11y(t);
  await rerenderWidget(baseConfig);

  // Go through authentication process to save cookie
  await identityPage.fillIdentifierField('cookieUser@okta.com');
  await identityPage.clickNextButton();

  await identityPage.fillPasswordField('testPassword');
  await identityPage.clickVerifyButton();

  await t.expect(identifyRequestLogger.count(() => true)).eql(2);
  const req = identifyRequestLogger.requests[0].request;
  const reqBody = JSON.parse(req.body);
  await t.expect(reqBody).contains({
    identifier: 'cookieUser@okta.com',
  });

  // Mock the server response to include identifier value
  await t.removeRequestHooks(identifyMock);
  await t.addRequestHooks(identifyWithUsernameMock);

  await identityPage.navigateToPage({ 'login_hint': 'testUsername@okta.com' });
  await rerenderWidget({
    features: {
      rememberMe: true,
      rememberMyUsernameOnOIE: true
    }
  });

  // Ensure identifier field is pre-filled with identifier returned in remediation
  const identifier = identityPage.getIdentifierValue();
  await t.expect(identifier).eql('testUsername@okta.com');
});


// OKTA-585939 Cookie is not updated in gen 3 widget
test.meta('v3', false).requestHooks(identifyRequestLogger, identifyMock)('should store identifier in ln cookie when updated', async t => {
  const identityPage = await setup(t);

  await t.setCookies({name: 'ln', value: 'PREFILL VALUE', httpOnly: false});

  await rerenderWidget({
    features: {
      rememberMe: true,
      rememberMyUsernameOnOIE: true
    }
  });

  await t.expect(identityPage.getIdentifierValue()).eql('PREFILL VALUE');

  await identityPage.fillIdentifierField('TestIdentifier');
  await identityPage.clickNextButton();

  const cookie = await t.getCookies('ln');

  await t
    .expect(cookie[0].name).eql('ln')
    .expect(cookie[0].value).eql('TestIdentifier');
});
