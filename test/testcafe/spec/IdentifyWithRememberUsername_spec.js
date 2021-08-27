import { RequestMock, RequestLogger } from 'testcafe';
import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import ChallengeEmailPageObject from '../framework/page-objects/ChallengeEmailPageObject';
import { renderWidget as rerenderWidget } from '../framework/shared';
import xhrIdentify from '../../../playground/mocks/data/idp/idx/identify';
import xhrPassword from '../../../playground/mocks/data/idp/idx/authenticator-verification-password';
import xhrErrorIdentify from '../../../playground/mocks/data/idp/idx/error-identify-access-denied';
import xhrSuccess from '../../../playground/mocks/data/idp/idx/success';
import xhrSuccessWithInteractionCode from '../../../playground/mocks/data/idp/idx/success-with-interaction-code.json';
import xhrIdentifyWithPassword from '../../../playground/mocks/data/idp/idx/identify-with-password';
import emailVerification from '../../../playground/mocks/data/idp/idx/authenticator-verification-email';
import xhrSuccessTokens from '../../../playground/mocks/data/oauth2/success-tokens';

const identifyWithError = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrIdentify)
  .onRequestTo('http://localhost:3000/idp/idx/identify')
  .respond(xhrPassword)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(xhrErrorIdentify, 403);  

const identifyWithPasswordError = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrIdentifyWithPassword)
  .onRequestTo('http://localhost:3000/idp/idx/identify')
  .respond(xhrErrorIdentify, 403);  

const identifyMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrIdentify)
  .onRequestTo('http://localhost:3000/idp/idx/identify')
  .respond(xhrPassword)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(xhrSuccess);

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
  .respond(xhrSuccessWithInteractionCode)
  .onRequestTo('http://localhost:3000/oauth2/default/v1/token')
  .respond(xhrSuccessTokens);

const identifyWithEmailAuthenticatorError = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrIdentify)
  .onRequestTo('http://localhost:3000/idp/idx/identify')
  .respond(emailVerification)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(xhrErrorIdentify, 403);

const identifyRequestLogger = RequestLogger(
  /idx\/identify|\/challenge/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
    logRequestHeaders: true,
  }
);

fixture('Identify With Remember Username');

async function setup(t, options) {
  const identityPage = new IdentityPageObject(t);
  await identityPage.navigateToPage(options || {});
  return identityPage;
}

test.requestHooks(identifyRequestLogger, identifyWithError)('identifer first flow - should NOT remember username after failed authentication', async t => {
  const identityPage = await setup(t);
  await rerenderWidget({
    features: {
      rememberMe: true,
    }
  });

  await identityPage.fillIdentifierField('test@okta.com');
  await identityPage.clickNextButton();

  await identityPage.fillPasswordField('testPassword');
  await identityPage.clickNextButton();

  await identityPage.waitForErrorBox();

  // Ensure identifier field is not pre-filled
  await identityPage.navigateToPage();
  const identifier = identityPage.getIdentifierValue();
  await t.expect(identifier).eql('');
});

test.requestHooks(identifyRequestLogger, identifyWithPasswordError)('identifer with password - should NOT remember username after failed authentication', async t => {
  const identityPage = await setup(t);
  await rerenderWidget({
    features: {
      rememberMe: true,
    }
  });

  await identityPage.fillIdentifierField('test@okta.com');
  await identityPage.fillPasswordField('testPassword');
  await identityPage.clickNextButton();

  await identityPage.waitForErrorBox();

  // Ensure identifier field is not pre-filled
  await identityPage.navigateToPage();
  const identifier = identityPage.getIdentifierValue();
  await t.expect(identifier).eql('');
});

test.requestHooks(identifyRequestLogger, identifyMock)('identifer first flow - should remember username after successful authentication', async t => {
  const identityPage = await setup(t);
  await rerenderWidget({
    features: {
      rememberMe: true,
    }
  });

  await identityPage.fillIdentifierField('testUser@okta.com');
  await identityPage.clickNextButton();

  await identityPage.fillPasswordField('testPassword');
  await identityPage.clickNextButton();  

  await t.expect(identifyRequestLogger.count(() => true)).eql(2);
  const req = identifyRequestLogger.requests[0].request;
  const reqBody = JSON.parse(req.body);
  await t.expect(reqBody).contains({
    identifier: 'testUser@okta.com',
  });

  // Ensure identifier field is pre-filled with saved username cookie
  await identityPage.navigateToPage();
  const identifier = identityPage.getIdentifierValue();
  await t.expect(identifier).eql('testUser@okta.com');
});

test.requestHooks(identifyRequestLogger, identifyWithPasswordMock)('identifer with password - should remember username after successful authentication', async t => {
  const identityPage = await setup(t);
  await rerenderWidget({
    features: {
      rememberMe: true,
    }
  });

  await identityPage.fillIdentifierField('testUser@okta.com');
  await identityPage.fillPasswordField('testPassword');
  await identityPage.clickNextButton();  

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
  const identifier = identityPage.getIdentifierValue();
  await t.expect(identifier).eql('testUser@okta.com');
});

test.requestHooks(identifyRequestLogger, identifyWithEmailAuthenticatorError)('identifer with email challenge - should NOT remember username after failed authentication', async t => {
  const identityPage = await setup(t);
  await rerenderWidget({
    features: {
      rememberMe: true,
    }
  });

  await identityPage.fillIdentifierField('testUser@okta.com');
  await identityPage.clickNextButton();

  const challengeEmailPageObject = new ChallengeEmailPageObject(t);
  await challengeEmailPageObject.clickEnterCodeLink();

  await challengeEmailPageObject.verifyFactor('credentials.passcode', '1234');
  await challengeEmailPageObject.clickNextButton();
  await challengeEmailPageObject.waitForErrorBox();

  // Ensure identifier field is not pre-filled
  await identityPage.navigateToPage();
  const identifier = identityPage.getIdentifierValue();
  await t.expect(identifier).eql('');
});

test.requestHooks(identifyRequestLogger, identifyWithEmailAuthenticator)('identifer with email challenge - should remember username after successful authentication', async t => {
  const optionsForInteractionCodeFlow = {
    clientId: 'fake',
    useInteractionCodeFlow: true,
    authParams: {
      ignoreSignature: true,
      pkce: true,
    },
    features: {
      rememberMe: true,
    },
    stateToken: undefined
  };

  const identityPage = await setup(t, { render: false });
  await identityPage.mockCrypto();
  await t.setNativeDialogHandler(() => true);
  await rerenderWidget(optionsForInteractionCodeFlow);

  await identityPage.fillIdentifierField('testUser@okta.com');
  await identityPage.clickNextButton();

  const challengeEmailPageObject = new ChallengeEmailPageObject(t);
  await challengeEmailPageObject.clickEnterCodeLink();

  await challengeEmailPageObject.verifyFactor('credentials.passcode', '1234');
  await challengeEmailPageObject.clickNextButton();

  const req = identifyRequestLogger.requests[0].request;
  const reqBody = JSON.parse(req.body);
  await t.expect(reqBody).contains({
    identifier: 'testUser@okta.com',
  });

  // Ensure identifier field is pre-filled with saved username cookie
  await identityPage.navigateToPage();
  const identifier = identityPage.getIdentifierValue();
  await t.expect(identifier).eql('testUser@okta.com');
});

test.requestHooks(identifyRequestLogger, identifyMock)('should pre-fill identifier field with config.username passed in and feature.rememberMe enabled', async t => {
  const identityPage = await setup(t);
  await rerenderWidget({
    features: {
      rememberMe: true,
    }
  });

  // Go through authentication process to save cookie
  await identityPage.fillIdentifierField('testUser@okta.com');
  await identityPage.clickNextButton();

  await identityPage.fillPasswordField('testPassword');
  await identityPage.clickNextButton();  

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
    }
  });

  const identifier = identityPage.getIdentifierValue();
  await t.expect(identifier).eql('configUsername@okta.com');
});

