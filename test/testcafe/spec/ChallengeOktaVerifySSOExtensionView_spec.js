import { RequestLogger, RequestMock, Selector } from 'testcafe';
import BasePageObject from '../framework/page-objects/BasePageObject';
import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import identifyUserVerificationWithCredentialSSOExtension from '../../../playground/mocks/data/idp/idx/authenticator-verification-okta-verify-signed-nonce-credential-sso-extension';
import identifyWithNoAppleCredentialSSOExtension from '../../../playground/mocks/data/idp/idx/identify-with-no-sso-extension';
import identify from '../../../playground/mocks/data/idp/idx/identify';

const logger = RequestLogger(/introspect/);
const verifyUrl = 'http://localhost:3000/idp/idx/authenticators/sso_extension/transactions/ft2FCeXuk7ov8iehMivYavZFhPxZUpBvB0/verify';

const credentialSSOExtensionMock = RequestMock()
  .onRequestTo(/idp\/idx\/introspect/)
  .respond(identifyUserVerificationWithCredentialSSOExtension)
  .onRequestTo(verifyUrl)
  .respond(identify);

const credentialSSONotExistLogger = RequestLogger(/introspect|verify\/cancel/);
const credentialSSONotExistMock = RequestMock()
  .onRequestTo(/idp\/idx\/introspect/)
  .respond(identifyWithNoAppleCredentialSSOExtension)
  .onRequestTo(/idp\/idx\/authenticators\/sso_extension\/transactions\/456\/verify\/cancel/)
  .respond(identify);

const identifyWithSSOExtensionWithoutMethod = JSON.parse(JSON.stringify(identifyUserVerificationWithCredentialSSOExtension));
// remove the sso extension method so that the rest of the flow can be verified
delete identifyWithSSOExtensionWithoutMethod.remediation.value[0].method;
const ssoExtensionWithoutMethodMock = RequestMock()
  .onRequestTo(/idp\/idx\/introspect/)
  .respond(identifyWithSSOExtensionWithoutMethod);

fixture('App SSO Extension View from MFA list');

test
  .requestHooks(logger, credentialSSOExtensionMock)('with credential SSO Extension approach, opens the verify URL', async t => {
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

test
  .requestHooks(credentialSSONotExistLogger, credentialSSONotExistMock)('cancels transaction when the authenticator does not exist', async t => {
    const ssoExtensionPage = new BasePageObject(t);
    await ssoExtensionPage.navigateToPage();
    await t.expect(credentialSSONotExistLogger.count(
      record => record.response.statusCode === 200 &&
    record.request.url.match(/introspect/)
    )).eql(1);
    await t.expect(credentialSSONotExistLogger.count(
      record => record.response.statusCode === 200 &&
    record.request.url.match(/verify\/cancel/)
    )).eql(1);
    const identityPage = new IdentityPageObject(t);
    await identityPage.fillIdentifierField('Test Identifier');
    await t.expect(identityPage.getIdentifierValue()).eql('Test Identifier');
  });

test
  .requestHooks(logger, ssoExtensionWithoutMethodMock)('the UI shows the correct content', async t => {
    const ssoExtensionPage = new BasePageObject(t);
    await ssoExtensionPage.navigateToPage();
    const ssoExtensionHeader = new Selector('.device-apple-sso-extension .siw-main-header');
    await t.expect(ssoExtensionHeader.find('.beacon-container').exists).eql(false);
    await t.expect(ssoExtensionPage.getFormTitle()).eql('Verifying your identity');
    await t.expect(Selector('.spinner').exists).ok();
    await t.expect(Selector('.spinner').getStyleProperty('display')).eql('none');
    await t.expect(ssoExtensionPage.form.el.hasClass('device-challenge-poll')).ok();
    await t.expect(Selector('[data-se="switchAuthenticator"]').innerText).eql('Verify with something else');
    await t.expect(Selector('[data-se="cancel"]').innerText).eql('Cancel');
  });
