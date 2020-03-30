import { RequestLogger, RequestMock, ClientFunction, Selector } from 'testcafe';
import BasePageObject from '../framework/page-objects/BasePageObject';
import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import identifyWithAppleRedirectSSOExtension from '../../../playground/mocks/idp/idx/data/identify-with-apple-redirect-sso-extension';
import identifyWithAppleCredentialSSOExtension from '../../../playground/mocks/idp/idx/data/identify-with-apple-credential-sso-extension';
import identify from '../../../playground/mocks/idp/idx/data/identify';

const logger = RequestLogger(/introspect/);
const verifyUrl = `http://localhost:3000/idp/idx/authenticators/sso_extension/transactions/123/verify?\
challengeRequest=eyJraWQiOiJCa2Y3LTVqa2d6eE1NYjBtS0pEX3hpaUxzZFNmLXZ6cks0MmFkcmcyWXEwIiwiYWxnIjoiUlMy\
NTYifQ.eyJpc3MiOiJodHRwczovL2R0ZGVtby53aWRlcm9jay5jb20iLCJhdWQiOiJva3RhLjYzYzA4MWRiLTFmMTMtNTA4NC04OD\
JmLWU3OWUxZTVlMmRhNyIsImV4cCI6MTU3ODYxODEzMiwiaWF0IjoxNTc4NjE3ODMyLCJqdGkiOiJ0cmFuc2FjdGlvbklkIiwibm9\
uY2UiOiJzYW1wbGVOb25jZSIsInNpZ25hbHMiOlsic2NyZWVuTG9jayIsInJvb3RQcml2aWxlZ2VzIiwiZnVsbERpc2tFbmNyeXB0\
aW9uIiwiaWQiLCJwbGF0Zm9ybSIsIm9zVmVyc2lvbiIsIm1hbnVmYWN0dXJlciIsIm1vZGVsIiwiZGV2aWNlQXR0ZXN0YXRpb24iX\
SwidXNlclZlcmlmaWNhdGlvblJlcXVpcmVtZW50IjpmYWxzZSwidmVyaWZpY2F0aW9uVXJpIjoiaHR0cHM6Ly9kdGRlbW8ud2lkZX\
JvY2suY29tL2F1dGhlbnRpY2F0b3JzL3Nzb19leHRlbnNpb24vdHJhbnNhY3Rpb25zL3t0cmFuc2FjdGlvbklkfS92ZXJpZnkiLCJ\
jYVN1YmplY3ROYW1lcyI6W10sImtleVR5cGUiOiJwcm9vZk9mUG9zc2Vzc2lvbiIsImZhY3RvclR5cGUiOiJjcnlwdG8iLCJ2ZXIi\
OjB9.aCsWAQHdU3MG6w7ZQl1csuw2UFb1yvH3es97McC6lFswAphkz6bIHNcagob2dhTwWMJ7_RbpZHqXcaZJ7skKZxYHEfdC9Uwr\
RzdHpy_4Oeq477n4NGsJLvJNKDi_FOEulqAtCMnjh20vEJI6e4uNIxoSSCfxRCzp-0tdRIJ_7dGM-IsyFjefcnbDyFZT7s4l1tbeO\
7KYXmWXzP00bA8jmcGLb7i9bFwhjw9OBCgdNcqxKXMLmWQA0JZritRDR6u0ZcEjykca-eUCJtG5ISQOONs_lUBGL3Ezz6QsfWtW16\
E9QJAVEwf06gULnbw5n6wpiAiDqa4HlkKP6K5-v1Y0XQ`;

const redirectSSOExtensionMock = RequestMock()
  .onRequestTo(/idp\/idx\/introspect/)
  .respond(identifyWithAppleRedirectSSOExtension)
  .onRequestTo(verifyUrl)
  .respond('<html><h1>Sign in verified</h1></html>');

const credentialSSOExtensionMock = RequestMock()
  .onRequestTo(/idp\/idx\/introspect/)
  .respond(identifyWithAppleCredentialSSOExtension)
  .onRequestTo(verifyUrl)
  .respond(identify);

fixture(`App SSO Extension View`);

const getPageUrl = ClientFunction(() => window.location.href);
test
  .requestHooks(logger, redirectSSOExtensionMock)(`with redirect SSO Extension approach, opens the verify URL`, async t => {
  const ssoExtensionPage = new BasePageObject(t);
  await ssoExtensionPage.navigateToPage();
  await t.expect(logger.count(
    record => record.response.statusCode === 200 &&
    record.request.url.match(/introspect/)
  )).eql(1);
  await t.expect(getPageUrl()).eql(verifyUrl);
  await t.expect(Selector('h1').innerText).eql('Sign in verified');
});

test
.requestHooks(logger, credentialSSOExtensionMock)(`with credential SSO Extension approach, opens the verify URL`, async t => {
  const ssoExtensionPage = new BasePageObject(t);
  await ssoExtensionPage.navigateToPage();
  await t.expect(logger.count(
    record => record.response.statusCode === 200 &&
    record.request.url.match(/introspect/)
  )).eql(1);
  const identityPage = new IdentityPageObject(t);
  await identityPage.fillIdentifierField('Test Identifier');
  await t.expect(identityPage.getIdentifierValue()).eql('Test Identifier');
});
