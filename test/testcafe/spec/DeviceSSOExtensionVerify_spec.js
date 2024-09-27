import { RequestLogger, RequestMock } from 'testcafe';
import BasePageObject from '../framework/page-objects/BasePageObject';
import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import identifyWithAppleRedirectSSOExtension from '../../../playground/mocks/data/idp/idx/authenticator-verification-okta-verify-apple-ssoe';
import appleSSOEVerifyProbe from '../../../playground/mocks/data/idp/idx/error-401-apple-ssoe';
import appleSSOEVerify from '../../../playground/mocks/data/idp/idx/apple-ssoe-verify.json';
import identify from '../../../playground/mocks/data/idp/idx/identify';

const logger = RequestLogger(/introspect/);

const credentialSSOExtensionMock = RequestMock()
  .onRequestTo(/idp\/idx\/introspect/)
  .respond(identifyWithAppleRedirectSSOExtension)
  .onRequestTo('http://localhost:3000/idp/idx/authenticators/sso_extension/transactions/verify_endpoint_not_called/verify')
  .respond((_, res) => {
    res.statusCode = '401';
    res.headers['content-type'] = 'application/json';
    res.setBody(appleSSOEVerifyProbe);
  })
  .onRequestTo('http://localhost:3000/idp/idx/authenticators/sso_extension/transactions/verify_endpoint_called/verify')
  .respond((_, res) => {
    res.statusCode = '401';
    res.headers['content-type'] = 'application/json';
    res.setBody(appleSSOEVerify);
  })
  .onRequestTo('http://localhost:3000/idp/idx/authenticators/sso_extension/transactions/ftDC_dKpmkN6t5hAVtw4fugVm-T_sdTnLu/verify/cancel')
  .respond(identify);

fixture('Apple SSO Extension Verify');

test
  .requestHooks(logger, credentialSSOExtensionMock)('with credential SSO Extension approach, opens the verify URL', async t => {
    const ssoExtensionPage = new BasePageObject(t);
    await ssoExtensionPage.navigateToPage();
    await t.expect(ssoExtensionPage.formExists()).ok();
    await t.expect(logger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/introspect/)
    )).eql(1);

    debugger;

    // verify the end result
    const identityPage = new IdentityPageObject(t);
    await identityPage.fillIdentifierField('Test Identifier');
    // await t.expect(identityPage.getIdentifierValue()).eql('Test Identifier');
  });
