import {RequestMock, RequestLogger, ClientFunction} from 'testcafe';

import ConsentPageObject from '../../framework/page-objects/ConsentPageObject';
import xhrConsentGranular from '../../../../playground/mocks/data/api/v1/authn/consent-required-granular.json';

const consentGranularMock = RequestMock()
  .onRequestTo('http://localhost:3000/api/v1/authn/introspect')
  .respond(xhrConsentGranular);

const requestLogger = RequestLogger(
  /api\/v1/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
  }
);

const rerenderWidget = ClientFunction((settings) => {
  window.renderPlaygroundWidget(settings);
});

async function setup(t) {
  const consentPage = new ConsentPageObject(t);
  await consentPage.navigateToPage();
  await rerenderWidget({
    stateToken: '00-dummy-state-token', //start with 00 to render legacy sign in widget
  });
  return consentPage;
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
    'openid',
    'View your profile information.\n\n' +
        'The exact data varies based on what profile information you have provided, such as: name, time zone, picture, or birthday.'
  ]);
});

test.requestHooks(requestLogger, consentGranularMock)('should show only mandatory scopes as disabled', async t => {
  const consentPage  = await setup(t);
  await t.expect(consentPage.getDisabledCheckBoxLabels()).eql([
    'openid',
    'View your profile information.\n\n' +
        'The exact data varies based on what profile information you have provided, such as: name, time zone, picture, or birthday.'
  ]);
});

test.requestHooks(requestLogger, consentGranularMock)('should display correct title text', async t => {
  const consentPage  = await setup(t);
  await t.expect(await consentPage.getGranularHeaderClientName()).eql('Janky App');
  await t.expect(await consentPage.getGranularHeaderText()).eql('requests access to your account');
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

  await consentPage.setScopeCheckBox('custom1', false);
  await consentPage.setScopeCheckBox('email', false);

  await consentPage.clickAllowButton();
  const { request: {body, method, url}} = requestLogger.requests[requestLogger.requests.length - 1];
  const jsonBody = JSON.parse(body);

  await t.expect(jsonBody.consent.optedScopes.openid).eql(true);
  await t.expect(jsonBody.consent.optedScopes.custom1).eql(false);
  await t.expect(jsonBody.consent.optedScopes.custom2).eql(true);
  await t.expect(jsonBody.consent.optedScopes.email).eql(false);
  await t.expect(jsonBody.consent.optedScopes.profile).eql(true);
  await t.expect(method).eql('post');
  await t.expect(url).eql('http://localhost:3000/api/v1/authn/consent');
});

test.requestHooks(requestLogger, consentGranularMock)('should send correct payload to /consent on "Cancel" click', async t => {
  const consentPage  = await setup(t);

  await consentPage.clickDontAllowButton();
  const { request: {body, method, url}} = requestLogger.requests[requestLogger.requests.length - 1];
  const jsonBody = JSON.parse(body);

  await t.expect(jsonBody.consent).eql(undefined);
  await t.expect(method).eql('post');
  await t.expect(url).eql('http://localhost:3000/api/v1/authn/cancel');
});
