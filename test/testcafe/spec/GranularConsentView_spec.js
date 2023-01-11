import { RequestMock, RequestLogger } from 'testcafe';

import ConsentPageObject from '../framework/page-objects/ConsentPageObject';
import SuccessPageObject from '../framework/page-objects/SuccessPageObject';

import xhrConsentGranular from '../../../playground/mocks/data/idp/idx/consent-granular';
import xhrSuccess from '../../../playground/mocks/data/idp/idx/success';
import terminalResetPasswordNotAllowed from '../../../playground/mocks/data/idp/idx/error-reset-password-not-allowed';
import TerminalPageObject from '../framework/page-objects/TerminalPageObject';

const consentGranularMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrConsentGranular)
  .onRequestTo('http://localhost:3000/idp/idx/consent')
  .respond(xhrSuccess);

const consentGranularFailedMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrConsentGranular)
  .onRequestTo('http://localhost:3000/idp/idx/consent')
  .respond(terminalResetPasswordNotAllowed);

const requestLogger = RequestLogger(/consent/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
  }
);

async function setup(t) {
  const consentPage = new ConsentPageObject(t);
  await consentPage.navigateToPage();
  return consentPage;
}

async function testRedirect(t) {
  const successPage = new SuccessPageObject(t);
  const pageUrl = await successPage.getPageUrl();
  return t.expect(pageUrl)
    .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
}

fixture('GranularConsent');

test.requestHooks(requestLogger, consentGranularMock)('should show scopes list', async t => {
  const consentPage  = await setup(t);
  await t.expect(consentPage.getScopeCheckBoxLabels()).eql([
    'View your mobile phone data plan.\n\n' +
        'This allows the app to view your mobile phone data plan.',
    'View your internet search history.',
    'View your email address.\n\n' +
        'This allows the app to view your email address.',
    'openid\n\n' +
        'Signals that a request is an OpenID request.',
    'View your profile information.\n\n' +
        'The exact data varies based on what profile information you have provided, such as: name, time zone, picture, or birthday.'
  ]);
});

test.requestHooks(requestLogger, consentGranularMock)('should show only mandatory scopes as disabled', async t => {
  const consentPage  = await setup(t);
  await t.expect(consentPage.getDisabledCheckBoxLabels()).eql([
    'openid\n\n' +
        'Signals that a request is an OpenID request.',
    'View your profile information.\n\n' +
        'The exact data varies based on what profile information you have provided, such as: name, time zone, picture, or birthday.'
  ]);
});

test.requestHooks(requestLogger, consentGranularMock)('should display correct title text', async t => {
  const consentPage  = await setup(t);
  await t.expect(await consentPage.getGranularHeaderClientName()).eql('Native client');
  await t.expect(await consentPage.getGranularHeaderText()).eql('requests access to');
});

test.requestHooks(requestLogger, consentGranularMock)('should display correct agreement text', async t => {
  const consentPage  = await setup(t);
  await t.expect(await consentPage.getConsentAgreementText()).eql('Allowing access will share');
});

test.requestHooks(requestLogger, consentGranularMock)('should display correct consent button labels', async t => {
  const consentPage  = await setup(t);
  await t.expect(await consentPage.getAllowButtonLabel()).eql('Allow Access');
  await t.expect(await consentPage.getDontAllowButtonLabel()).eql('Cancel');
});

test.requestHooks(requestLogger, consentGranularMock)('should send correct payload to /consent on "Allow Access" click', async t => {
  const consentPage  = await setup(t);

  await consentPage.setScopeCheckBox('optedScopes.custom1', false);
  await consentPage.setScopeCheckBox('optedScopes.email', false);

  await consentPage.clickAllowButton();
  const { request: {body, method, url}} = requestLogger.requests[requestLogger.requests.length - 1];
  const jsonBody = JSON.parse(body);

  await t.expect(jsonBody.consent).eql(true);
  await t.expect(jsonBody.optedScopes.openid).eql(true);
  await t.expect(jsonBody.optedScopes.custom1).eql(false);
  await t.expect(jsonBody.optedScopes.custom2).eql(true);
  await t.expect(jsonBody.optedScopes.email).eql(false);
  await t.expect(jsonBody.optedScopes.profile).eql(true);
  await t.expect(method).eql('post');
  await t.expect(url).eql('http://localhost:3000/idp/idx/consent');

  await testRedirect(t);
});

test.requestHooks(requestLogger, consentGranularMock)('should send correct payload to /consent on "Cancel" click', async t => {
  const consentPage  = await setup(t);

  await consentPage.clickDontAllowButton();
  const { request: {body, method, url}} = requestLogger.requests[requestLogger.requests.length - 1];
  const jsonBody = JSON.parse(body);

  await t.expect(jsonBody.consent).eql(false);
  await t.expect(method).eql('post');
  await t.expect(url).eql('http://localhost:3000/idp/idx/consent');

  await testRedirect(t);
});

test.requestHooks(requestLogger, consentGranularFailedMock)('should go to Terminal View after giving consent and failed', async t => {
  const consentPage  = await setup(t);

  await consentPage.clickDontAllowButton();
  const { request: {body, method, url}} = requestLogger.requests[requestLogger.requests.length - 1];
  const jsonBody = JSON.parse(body);

  await t.expect(jsonBody.consent).eql(false);
  await t.expect(method).eql('post');
  await t.expect(url).eql('http://localhost:3000/idp/idx/consent');

  const terminalPageObject = new TerminalPageObject(t);
  await t.expect(await terminalPageObject.goBackLinkExists()).notOk();
  await t.expect(await terminalPageObject.signoutLinkExists()).ok();
  await t.expect(terminalPageObject.getErrorMessages().isError()).eql(true);
  await t.expect(terminalPageObject.getErrorMessages().getTextContent()).contains('Reset password is not allowed at this time. Please contact support for assistance.');
});

