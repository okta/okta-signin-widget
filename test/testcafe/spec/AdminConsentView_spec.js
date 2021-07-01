import { RequestMock, RequestLogger } from 'testcafe';

import ConsentPageObject from '../framework/page-objects/ConsentPageObject';
import SuccessPageObject from '../framework/page-objects/SuccessPageObject';

import xhrConsentAdmin from '../../../playground/mocks/data/idp/idx/consent-admin';
import xhrSuccess from '../../../playground/mocks/data/idp/idx/success';

const consentAdminMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrConsentAdmin)
  .onRequestTo('http://localhost:3000/idp/idx/consent')
  .respond(xhrSuccess);

const requestLogger = RequestLogger(/consent/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
  }
);

fixture('AdminConsent');

async function setup(t) {
  const consentPage = new ConsentPageObject(t);
  await consentPage.navigateToPage();
  // await a11yCheck(t); // Image embedded in an anchor tag without discernible text OKTA-TODO

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

  await t.expect(consentPage.getScopeGroupName()).eql('Resource and policies');
  await t.expect(consentPage.getScopeItemTexts()).eql([
    'okta.authenticators.manage',
    'okta.clients.manage',
  ]);
});

test.requestHooks(requestLogger, consentAdminMock)('should call /consent and send {consent: true} on "Allow Access" click', async t => {
  const consentPage  = await setup(t);

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

  await consentPage.clickDontAllowButton();
  const { request: {body, method, url}} = requestLogger.requests[requestLogger.requests.length - 1];
  const jsonBody = JSON.parse(body);

  await t.expect(jsonBody.consent).eql(false);
  await t.expect(method).eql('post');
  await t.expect(url).eql('http://localhost:3000/idp/idx/consent');

  await testRedirect(t);
});

