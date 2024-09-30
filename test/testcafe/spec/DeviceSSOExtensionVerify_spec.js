import { RequestLogger, RequestMock } from 'testcafe';
import BasePageObject from '../framework/page-objects/BasePageObject';
import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import identifyWithAppleRedirectSSOExtension from '../../../playground/mocks/data/idp/idx/identify-with-apple-redirect-sso-extension-2.json';
import appleSSOEVerifyProbe from '../../../playground/mocks/data/idp/idx/error-401-apple-sso-extension-verify.json';
import appleSSOEVerify from '../../../playground/mocks/data/idp/idx/apple-sso-extension-verify-cancel.json';
import identify from '../../../playground/mocks/data/idp/idx/identify';

const logger = RequestLogger(/introspect|verify/);

let verifyCallCount = -1;

const credentialSSOExtensionMock = RequestMock()
  .onRequestTo(/idp\/idx\/introspect/)
  .respond(identifyWithAppleRedirectSSOExtension)
  .onRequestTo('http://localhost:3000/idp/idx/authenticators/sso_extension/transactions/456/verify')
  .respond((req, res) => {
    verifyCallCount++;
    res.statusCode = 401;
    res.headers['content-type'] = 'application/json';
    res.headers['WWW-Authenticate'] = 'Oktadevicejwt realm="Okta Device"';
    res.setBody(verifyCallCount % 2 === 0 ? appleSSOEVerifyProbe : appleSSOEVerify);
  })
  .onRequestTo('http://localhost:3000/idp/idx/authenticators/sso_extension/transactions/456/verify/cancel')
  .respond(identify);

fixture('Apple SSO Extension Verify');

test
  .requestHooks(logger, credentialSSOExtensionMock)('with credential SSO Extension approach, opens the verify URL', async t => {
    verifyCallCount = -1;
    const ssoExtensionPage = new BasePageObject(t);
    await ssoExtensionPage.navigateToPage();
    await t.expect(ssoExtensionPage.formExists()).ok();
    await t.expect(logger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/introspect/)
    )).eql(1);

    // verify the end result
    const identityPage = new IdentityPageObject(t);
    await identityPage.fillIdentifierField('Test Identifier');
    await t.expect(identityPage.getIdentifierValue()).eql('Test Identifier');

    // verify requests count
    await t.expect(logger.count(
      record => record.request.url.match(/transactions\/.+?\/verify/) &&
        !record.request.url.match(/transactions\/.+?\/verify\/cancel/)
    )).eql(2);
    await t.expect(logger.count(
      record => record.request.url.match(/transactions\/.+?\/verify\/cancel/)
    )).eql(1);
  });