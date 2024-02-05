import { RequestLogger, RequestMock, Selector } from 'testcafe';
import BasePageObject from '../framework/page-objects/BasePageObject';
import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import identifyUserVerificationWithCredentialSSOExtension from '../../../playground/mocks/data/idp/idx/authenticator-verification-okta-verify-signed-nonce-credential-sso-extension';
import identifyWithNoAppleCredentialSSOExtension from '../../../playground/mocks/data/idp/idx/identify-with-no-sso-extension';
import identifyWithUserVerificationBiometricsErrorDesktop from '../../../playground/mocks/data/idp/idx/error-okta-verify-uv-fastpass-verify-enable-biometrics-desktop.json';
import identifyWithUserVerificationBiometricsErrorMobile from '../../../playground/mocks/data/idp/idx/error-400-okta-verify-uv-fastpass-verify-enable-biometrics-mobile.json';
import identify from '../../../playground/mocks/data/idp/idx/identify';
import { Constants } from '../framework/shared';
import { getStateHandleFromSessionStorage } from '../framework/shared';

const logger = RequestLogger(/introspect/);
const verifyUrl = 'http://localhost:3000/idp/idx/authenticators/sso_extension/transactions/ft2FCeXuk7ov8iehMivYavZFhPxZUpBvB0/verify';

const credentialSSOExtensionMock = RequestMock()
  .onRequestTo(/idp\/idx\/introspect/)
  .respond(identifyUserVerificationWithCredentialSSOExtension)
  .onRequestTo(verifyUrl)
  .respond((req, res) => {
    return new Promise((resolve) => setTimeout(function() {
      res.headers['content-type'] = 'application/json';
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


const credentialSSOExtensionBiometricsErrorDesktopMock = RequestMock()
  .onRequestTo(/idp\/idx\/introspect/)
  .respond(identifyUserVerificationWithCredentialSSOExtension)
  .onRequestTo(verifyUrl)
  .respond((req, res) => {
    res.statusCode = '400';
    res.headers['content-type'] = 'application/json';
    res.setBody(identifyWithUserVerificationBiometricsErrorDesktop);
  });

const credentialSSOExtensionBiometricsErrorMobileMock = RequestMock()
  .onRequestTo(/idp\/idx\/introspect/)
  .respond(identifyUserVerificationWithCredentialSSOExtension)
  .onRequestTo(verifyUrl)
  .respond((req, res) => {
    res.statusCode = '400';
    res.headers['content-type'] = 'application/json';
    res.setBody(identifyWithUserVerificationBiometricsErrorMobile);
  });


fixture('App SSO Extension View from MFA list');

test
  .requestHooks(logger, credentialSSOExtensionMock)('with credential SSO Extension approach, opens the verify URL', async t => {
    const ssoExtensionPage = new BasePageObject(t);
    await ssoExtensionPage.navigateToPage();
    await t.expect(ssoExtensionPage.formExists()).ok();
    await t.expect(logger.count(
      record => record.response.statusCode === 200 &&
        record.request.url.match(/introspect/)
    )).eql(1);

    // verify ui content
    const ssoExtensionHeader = new Selector('.device-apple-sso-extension .siw-main-header');
    await t.expect(ssoExtensionHeader.find('.beacon-container').exists).eql(false);
    await t.expect(ssoExtensionPage.getFormTitle()).eql('Verifying your identity');
    await t.expect(ssoExtensionPage.spinnerExists()).eql(true);
    await t.expect(await ssoExtensionPage.verifyWithSomethingElseLinkExists()).eql(true);
    await t.expect(await ssoExtensionPage.getCancelLink().exists).eql(true);

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
    const ssoExtensionPage = new BasePageObject(t);
    await ssoExtensionPage.navigateToPage();
    await t.expect(ssoExtensionPage.formExists()).ok();
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

test
  .requestHooks(credentialSSOExtensionBiometricsErrorMobileMock)('show biometrics error for mobile platform in credential SSO Extension', async t => {
    const ssoExtensionPage = new BasePageObject(t);
    await ssoExtensionPage.navigateToPage();
    await t.expect(ssoExtensionPage.formExists()).ok();

    const errorText = ssoExtensionPage.getErrorBoxText();
    await t.expect(errorText).contains('Biometrics needed for Okta Verify');
    await t.expect(errorText).contains('Your response was received, but your organization requires biometrics.');
    await t.expect(errorText).contains('Make sure you meet the following requirements, then try again');
    await t.expect(errorText).contains('Your device supports biometrics');
    await t.expect(errorText).contains('Okta Verify is up-to-date');
    await t.expect(errorText).contains('In Okta Verify, biometrics are enabled for your account');
    await t.expect(errorText).notContains('Your device\'s biometric sensors are accessible');
  });

test
  .requestHooks(credentialSSOExtensionBiometricsErrorDesktopMock)('show biometrics error for desktop platform in credential SSO Extension', async t => {
    const ssoExtensionPage = new BasePageObject(t);
    await ssoExtensionPage.navigateToPage();
    await t.expect(ssoExtensionPage.formExists()).ok();

    const errorText = ssoExtensionPage.getErrorBoxText();
    await t.expect(errorText).contains('Biometrics needed for Okta Verify');
    await t.expect(errorText).contains('Your response was received, but your organization requires biometrics.');
    await t.expect(errorText).contains('Make sure you meet the following requirements, then try again');
    await t.expect(errorText).contains('Your device supports biometrics');
    await t.expect(errorText).contains('Okta Verify is up-to-date');
    await t.expect(errorText).contains('In Okta Verify, biometrics are enabled for your account');
    await t.expect(errorText).contains('Your device\'s biometric sensors are accessible');
  });