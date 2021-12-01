import { RequestLogger, RequestMock, Selector } from 'testcafe';
import BasePageObject from '../framework/page-objects/BasePageObject';
import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import identifyUserVerificationWithCredentialSSOExtension from '../../../playground/mocks/data/idp/idx/authenticator-verification-okta-verify-signed-nonce-credential-sso-extension';
import identifyWithNoAppleCredentialSSOExtension from '../../../playground/mocks/data/idp/idx/identify-with-no-sso-extension';
import identify from '../../../playground/mocks/data/idp/idx/identify';
import { a11yCheck, Constants } from '../framework/shared';
import { getStateHandleFromSessionStorage } from '../framework/shared';

const logger = RequestLogger(/introspect/);
const verifyUrl = 'http://localhost:3000/idp/idx/authenticators/sso_extension/transactions/ft2FCeXuk7ov8iehMivYavZFhPxZUpBvB0/verify';

const credentialSSOExtensionMock = RequestMock()
  .onRequestTo(/idp\/idx\/introspect/)
  .respond(identifyUserVerificationWithCredentialSSOExtension)
  .onRequestTo(verifyUrl)
  .respond((req, res) => {
    return new Promise((resolve) => setTimeout(function() {
      res.setBody(identify);
      resolve(res);
    }, Constants.TESTCAFE_DEFAULT_AJAX_WAIT + 1000));
  });

const credentialSSONotExistLogger = RequestLogger(/introspect|verify\/cancel/);
const credentialSSONotExistMock = RequestMock()
  .onRequestTo(/idp\/idx\/introspect/)
  .respond(identifyWithNoAppleCredentialSSOExtension)
  .onRequestTo(/idp\/idx\/authenticators\/sso_extension\/transactions\/456\/verify\/cancel/)
  .respond(identify);

async function setup(t) {
    const ssoExtensionPage = new BasePageObject(t);
    await ssoExtensionPage.navigateToPage();
    await a11yCheck(t);

    return ssoExtensionPage;
}

fixture('App SSO Extension View from MFA list');

test
  .requestHooks(logger, credentialSSOExtensionMock)('with credential SSO Extension approach, opens the verify URL', async t => {
      const ssoExtensionPage = await setup(t);
    await t.expect(logger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/introspect/)
    )).eql(1);

    // verify ui content
    const ssoExtensionHeader = new Selector('.device-apple-sso-extension .siw-main-header');
    await t.expect(ssoExtensionHeader.find('.beacon-container').exists).eql(false);
    await t.expect(ssoExtensionPage.getFormTitle()).eql('Verifying your identity');
    await t.expect(Selector('.spinner').exists).ok();
    await t.expect(ssoExtensionPage.form.el.hasClass('device-challenge-poll')).ok();
    await t.expect(Selector('[data-se="switchAuthenticator"]').innerText).eql('Verify with something else');
    await t.expect(Selector('[data-se="cancel"]').innerText).eql('Back to sign in');

    // the next ajax mock (credentialSSOExtensionMock) set up for delaying 4s
    // testcafe waits 3s by default for ajax call
    // hence wait another 1s for ajax to complete
    await t.wait(1000);

    // verify the end result
    const identityPage = new IdentityPageObject(t);
    await identityPage.fillIdentifierField('Test Identifier');
    await t.expect(identityPage.getIdentifierValue()).eql('Test Identifier');
  });

test
  .requestHooks(credentialSSONotExistLogger, credentialSSONotExistMock)('cancels transaction when the authenticator does not exist', async t => {
      await setup(t);
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
    await t.expect(getStateHandleFromSessionStorage()).eql(null);
  });
