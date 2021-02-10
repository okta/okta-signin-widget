import { RequestMock, RequestLogger } from 'testcafe';

import ConsentPageObject from '../framework/page-objects/ConsentPageObject';
import SuccessPageObject from '../framework/page-objects/SuccessPageObject';
import IdentityPageObject from '../framework/page-objects/IdentityPageObject';

import xhrConsentAdmin from '../../../playground/mocks/data/idp/idx/consent-admin';
import xhrConsentEnduser from '../../../playground/mocks/data/idp/idx/consent-enduser';
import xhrSuccess from '../../../playground/mocks/data/idp/idx/success';
import xhrIdentify from '../../../playground/mocks/data/idp/idx/identify';


const consentAdminAllowMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrConsentAdmin)
  .onRequestTo('http://localhost:3000/idp/idx/consent')
  .respond(xhrSuccess);

const consentAdminDenyMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrConsentAdmin)
  .onRequestTo('http://localhost:3000/idp/idx/cancel')
  .respond(xhrIdentify);

const consentEnduserAllowMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrConsentEnduser)
  .onRequestTo('http://localhost:3000/idp/idx/consent')
  .respond(xhrSuccess);

const consentEnduserDenyMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrConsentEnduser)
  .onRequestTo('http://localhost:3000/idp/idx/cancel')
  .respond(xhrIdentify);


const requestLogger = RequestLogger(/consent|cancel/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
  }
);

fixture('AdminConsent');

async function setup(t) {
  const consentPage = new ConsentPageObject(t);
  await consentPage.navigateToPage();
  return consentPage;
}

test.requestHooks(requestLogger, consentAdminAllowMock)('should render scopes', async t => {
  const consentPage  = await setup(t);

  await t.expect(consentPage.getScopeGroupName()).eql('Resource and policies');
  await t.expect(consentPage.getScopeItemTexts()).eql([
    'okta.authenticators.manage',
    'okta.clients.manage',
  ]);
});

test.requestHooks(requestLogger, consentAdminAllowMock)('should call /consent and send scopes on form submit', async t => {
  const consentPage  = await setup(t);

  await consentPage.clickAllowButton();
  const { request: {body, method, url}} = requestLogger.requests[requestLogger.requests.length - 1];
  const jsonBody = JSON.parse(body);

  await t.expect(jsonBody.scopes).eql([
    'okta.clients.manage',
    'okta.authenticators.manage',
  ]);
  await t.expect(method).eql('post');
  await t.expect(url).eql('http://localhost:3000/idp/idx/consent');

  const successPage = new SuccessPageObject(t);
  const pageUrl = await successPage.getPageUrl();
  await t.expect(pageUrl)
    .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
});

test.requestHooks(requestLogger, consentAdminDenyMock)('should call /cancel on form cancel', async t => {
  const consentPage  = await setup(t);

  await consentPage.clickDontAllowButton();
  const { request: {body, method, url}} = requestLogger.requests[requestLogger.requests.length - 1];
  const jsonBody = JSON.parse(body);

  await t.expect(jsonBody).eql({stateHandle: '01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82'});
  await t.expect(method).eql('post');
  await t.expect(url).eql('http://localhost:3000/idp/idx/cancel');

  const identityPage = new IdentityPageObject(t);
  const pageUrl = await identityPage.getPageUrl();
  await t.expect(pageUrl).eql('http://localhost:3000/');
});

fixture('EnduserConsent');

test.requestHooks(requestLogger, consentEnduserAllowMock)('should render scopes', async t => {
  const consentPage  = await setup(t);

  await t.expect(consentPage.getScopeItemTexts()).eql([
    'View your email address.',
    'View your phone number.',
  ]);
});

test.requestHooks(requestLogger, consentEnduserAllowMock)('should call /consent and send scopes on form submit', async t => {
  const consentPage  = await setup(t);

  await consentPage.clickAllowButton();
  const { request: {body, method, url}} = requestLogger.requests[requestLogger.requests.length - 1];
  const jsonBody = JSON.parse(body);

  await t.expect(jsonBody.scopes).eql([
    'email',
    'phone',
  ]);
  await t.expect(method).eql('post');
  await t.expect(url).eql('http://localhost:3000/idp/idx/consent');

  const successPage = new SuccessPageObject(t);
  const pageUrl = await successPage.getPageUrl();
  await t.expect(pageUrl)
    .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
});

test.requestHooks(requestLogger, consentEnduserDenyMock)('should call /cancel on form cancel', async t => {
  const consentPage  = await setup(t);

  await consentPage.clickDontAllowButton();
  const { request: {body, method, url}} = requestLogger.requests[requestLogger.requests.length - 1];
  const jsonBody = JSON.parse(body);

  await t.expect(jsonBody).eql({stateHandle: '01OCl7uyAUC4CUqHsObI9bvFiq01cRFgbnpJQ1bz82'});
  await t.expect(method).eql('post');
  await t.expect(url).eql('http://localhost:3000/idp/idx/cancel');

  const identityPage = new IdentityPageObject(t);
  const pageUrl = await identityPage.getPageUrl();
  await t.expect(pageUrl).eql('http://localhost:3000/');
});
