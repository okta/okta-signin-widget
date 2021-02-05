import { RequestMock, RequestLogger } from 'testcafe';

import ConsentPageObject from '../framework/page-objects/ConsentPageObject';
import SuccessPageObject from '../framework/page-objects/SuccessPageObject';

import xhrConsent from '../../../playground/mocks/data/idp/idx/admin-consent';
import xhrSuccess from '../../../playground/mocks/data/idp/idx/success';


const consentMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrConsent)
  .onRequestTo('http://localhost:3000/idp/idx/consent')
  .respond(xhrSuccess);


const requestLogger = RequestLogger(/consent/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
  }
);

fixture('Consent');

async function setup(t) {
  const consentPage = new ConsentPageObject(t);
  await consentPage.navigateToPage();
  return consentPage;
}

test.requestHooks(requestLogger, consentMock)('should render scopes', async t => {
  const consentPage  = await setup(t);

  await t.expect(consentPage.getScopeGroupName()).eql('Resource and policies');
  await t.expect(consentPage.getScopeItemTexts()).eql([
    'okta.authenticators.manage',
    'okta.clients.manage',
  ]);
});

test.requestHooks(requestLogger, consentMock)('should call /consent and send scopes on form submit', async t => {
  const consentPage  = await setup(t);

  await consentPage.clickAllowButton();
  const { request: {body, method, url}} = requestLogger.requests[0];
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

// TODO: handle BaseForm cancel 
// test.requestHooks(requestLogger, consentMock)('should call /cancel on form cancel', async t => {
//   const consentPage  = await setup(t);

//   await consentPage.clickDontAllowButton();
//   const { request: {body, method, url}} = requestLogger.requests[0];
//   const jsonBody = JSON.parse(body);

//   await t.expect(jsonBody).eql({});
//   await t.expect(method).eql('post');
//   await t.expect(url).eql('http://localhost:3000/api/v1/idx/cancel');
// });
