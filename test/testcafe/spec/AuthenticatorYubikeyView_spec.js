import { RequestMock, RequestLogger } from 'testcafe';
import { checkA11y } from '../framework/a11y';
import { checkConsoleMessages, overrideWidgetOptions } from '../framework/shared';
import YubiKeyAuthenticatorPageObject from '../framework/page-objects/YubiKeyAuthenticatorPageObject';
import xhrEnrollYubiKeyAuthenticator from '../../../playground/mocks/data/idp/idx/authenticator-enroll-yubikey';
import xhrVerifyYubiKeyAuthenticator from '../../../playground/mocks/data/idp/idx/authenticator-verification-yubikey';
import xhrSuccess from '../../../playground/mocks/data/idp/idx/success';

const logger = RequestLogger(/introspect/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
  }
);

const enrollMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrEnrollYubiKeyAuthenticator)
  .onRequestTo('http://localhost:3000/idp/idx/credential/enroll')
  .respond(xhrEnrollYubiKeyAuthenticator)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(xhrSuccess);

const verifyMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrVerifyYubiKeyAuthenticator)
  .onRequestTo('http://localhost:3000/idp/idx/challenge')
  .respond(xhrVerifyYubiKeyAuthenticator)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(xhrSuccess);

async function setup(t) {
  const pageObject = new YubiKeyAuthenticatorPageObject(t);
  await pageObject.navigateToPage();
  await t.expect(pageObject.formExists()).ok();
  return pageObject;
}

fixture('Enroll YubiKey Authenticator');

test
  .requestHooks(logger, enrollMock)('enroll with YubiKey authenticator', async t => {
    const pageObject = await setup(t);
    await checkA11y(t);

    await t.expect(pageObject.getFormTitle()).eql('Set up YubiKey');
    await t.expect(pageObject.getFormSubtitle()).eql('Use your YubiKey to insert a verification code.');

    await checkConsoleMessages({
      controller: 'enroll-yubikey',
      formName: 'enroll-authenticator',
      authenticatorKey:'yubikey_token',
      methodType: 'otp'
    });

    await t.expect(pageObject.getFormTitle()).eql('Set up YubiKey');
    await t.expect(pageObject.getFormSubtitle()).eql('Use your YubiKey to insert a verification code.');
    
    // Fill out form and submit
    await pageObject.verifyFactor('credentials.passcode', '1234');
    await pageObject.clickEnrollButton();

    const pageUrl = await pageObject.getPageUrl();
    await t.expect(pageUrl).eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
  });

test
  .requestHooks(logger, enrollMock)('enroll with YubiKey authenticator outputs form errors', async t => {
    const pageObject = await setup(t);
    await checkA11y(t);

    await t.expect(pageObject.getFormTitle()).eql('Set up YubiKey');
    
    // Do not fill out the form and submit
    await pageObject.clickEnrollButton();

    await pageObject.form.waitForErrorBox();
    await t.expect(pageObject.form.getErrorBoxText()).contains('We found some errors. Please review the form and make corrections.');
  });

fixture('Verify YubiKey Authenticator');
test
  .requestHooks(logger, verifyMock)('verify with YubiKey authenticator', async t => {
    const pageObject = await setup(t);
    await checkA11y(t);

    await t.expect(pageObject.getFormTitle()).eql('Verify with YubiKey');
    await t.expect(pageObject.getFormSubtitle()).eql('Use your YubiKey to insert a verification code.');

    await checkConsoleMessages({
      controller: 'mfa-verify',
      formName: 'challenge-authenticator',
      authenticatorKey:'yubikey_token',
      methodType: 'otp'
    });

    await t.expect(pageObject.getFormTitle()).eql('Verify with YubiKey');
    await t.expect(pageObject.getFormSubtitle()).eql('Use your YubiKey to insert a verification code.');
    
    // Fill out form and submit
    await pageObject.verifyFactor('credentials.passcode', '1234');
    await pageObject.clickVerifyButton();

    const pageUrl = await pageObject.getPageUrl();
    await t.expect(pageUrl).eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
  });

test
  .requestHooks(logger, verifyMock)('verify with YubiKey authenticator outputs form errors', async t => {
    const pageObject = await setup(t);
    await checkA11y(t);

    await t.expect(pageObject.getFormTitle()).eql('Verify with YubiKey');
    
    await pageObject.clickVerifyButton();

    await pageObject.form.waitForErrorBox();
    await t.expect(pageObject.form.getErrorBoxText()).contains('We found some errors. Please review the form and make corrections.');
  });

test
  .clientScripts(overrideWidgetOptions({
    helpLinks: {
      factorPage: {
        text: 'custom factor page link',
        href: 'https://acme.com/what-is-okta-autheticators',
      },
    },
  }))
  .requestHooks(verifyMock)('should show custom factor page link', async t => {
    const pageObject = await setup(t);
    await checkA11y(t);

    await t.expect(pageObject.getFactorPageHelpLinksLabel()).eql('custom factor page link');
    await t.expect(pageObject.getFactorPageHelpLink()).eql('https://acme.com/what-is-okta-autheticators');
  });
