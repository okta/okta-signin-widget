import { RequestMock, RequestLogger, userVariables } from 'testcafe';
import { checkA11y, oktaDashboardContent } from '../framework/a11y';

import ConsentPageObject from '../framework/page-objects/ConsentPageObject';
import SuccessPageObject from '../framework/page-objects/SuccessPageObject';

import xhrConsentAdmin from '../../../playground/mocks/data/idp/idx/consent-admin';
import xhrSuccess from '../../../playground/mocks/data/idp/idx/success';


const consentAdminMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrConsentAdmin)
  .onRequestTo('http://localhost:3000/idp/idx/consent')
  .respond(xhrSuccess)
  .onRequestTo(/^http:\/\/localhost:3000\/app\/UserHome.*/)
  .respond(oktaDashboardContent);

const requestLogger = RequestLogger(/consent/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
  }
);

fixture('AdminConsent').meta('v3', true);

async function setup(t) {
  const consentPage = new ConsentPageObject(t);
  await consentPage.navigateToPage();
  await t.expect(consentPage.formExists()).eql(true);
  return consentPage;
}

async function testRedirect(t) {
  const successPage = new SuccessPageObject(t);
  const pageUrl = await successPage.getPageUrl();
  return t.expect(pageUrl)
    .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
}

test.requestHooks(requestLogger, consentAdminMock)('should render scopes', async t => {
  const consentPage  = await setup(t);
  await checkA11y(t);

  await t.expect(consentPage.getScopeGroupName()).eql('Resource and policies');
  // In Gen3 SIW UX decided to only display scope description instead of scope value. 
  const scopeTextArr = userVariables.v3
    ? ['Allows the app to manage clients in your Okta organization.', 'Allows the app to manage all security methods (e.g. enrollments, reset).']
    : ['okta.authenticators.manage', 'okta.clients.manage',];
  await t.expect(consentPage.getScopeItemTexts()).eql(scopeTextArr);
});

test.requestHooks(requestLogger, consentAdminMock)('should call /consent and send {consent: true} on "Allow Access" click', async t => {
  const consentPage  = await setup(t);
  await checkA11y(t);

  await consentPage.clickAllowButton();
  const { request: {body, method, url}} = requestLogger.requests[requestLogger.requests.length - 1];
  const jsonBody = JSON.parse(body);

  await t.expect(jsonBody.consent).eql(true);
  await t.expect(method).eql('post');
  await t.expect(url).eql('http://localhost:3000/idp/idx/consent');

  await testRedirect(t);
});

test.requestHooks(requestLogger, consentAdminMock)('should call /consent and send {consent: false} on "Don\'t Allow" click', async t => {
  const consentPage  = await setup(t);
  await checkA11y(t);

  await consentPage.clickDontAllowButton();
  const { request: {body, method, url}} = requestLogger.requests[requestLogger.requests.length - 1];
  const jsonBody = JSON.parse(body);

  await t.expect(jsonBody.consent).eql(false);
  await t.expect(method).eql('post');
  await t.expect(url).eql('http://localhost:3000/idp/idx/consent');

  await testRedirect(t);
});

