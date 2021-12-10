import { RequestMock, RequestLogger } from 'testcafe';
import {a11yCheck, checkConsoleMessages} from '../framework/shared';
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
  await a11yCheck(t);
  return pageObject;
}

fixture('Enroll YubiKey Authenticator');
test
  .requestHooks(logger, enrollMock)('enroll with YubiKey authenticator', async t => {
    const pageObject = await setup(t);

    await checkConsoleMessages({
      controller: 'enroll-yubikey',
      formName: 'enroll-authenticator',
      authenticatorKey:'yubikey_token',
      methodType: 'otp'
    });

    await t.expect(pageObject.getFormTitle()).eql('Set up YubiKey');
    await t.expect(pageObject.getFormSubtitle()).eql('Insert the YubiKey into a USB port and tap it to generate a verification code.');
    
    // Fill out form and submit
    await pageObject.verifyFactor('credentials.passcode', '1234');
    await pageObject.submit();

    const pageUrl = await pageObject.getPageUrl();
    await t.expect(pageUrl).eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
  });

test
  .requestHooks(logger, enrollMock)('enroll with YubiKey authenticator outputs form errors', async t => {
    const pageObject = await setup(t);

    await t.expect(pageObject.getFormTitle()).eql('Set up YubiKey');
    
    // Do not fill out the form and submit
    await pageObject.submit();

    pageObject.form.waitForErrorBox();
    await t.expect(pageObject.form.getErrorBoxText()).eql('We found some errors. Please review the form and make corrections.');
  });

fixture('Verify YubiKey Authenticator');
test
  .requestHooks(logger, verifyMock)('verify with YubiKey authenticator', async t => {
    const pageObject = await setup(t);

    await checkConsoleMessages({
      controller: 'mfa-verify',
      formName: 'challenge-authenticator',
      authenticatorKey:'yubikey_token',
      methodType: 'otp'
    });

    await t.expect(pageObject.getFormTitle()).eql('Verify with YubiKey');
    await t.expect(pageObject.getFormSubtitle()).eql('Insert the YubiKey into a USB port and tap it to generate a verification code.');
    
    // Fill out form and submit
    await pageObject.verifyFactor('credentials.passcode', '1234');
    await pageObject.submit();

    const pageUrl = await pageObject.getPageUrl();
    await t.expect(pageUrl).eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
  });

test
  .requestHooks(logger, verifyMock)('verify with YubiKey authenticator outputs form errors', async t => {
    const pageObject = await setup(t);

    await t.expect(pageObject.getFormTitle()).eql('Verify with YubiKey');
    
    await pageObject.submit();

    pageObject.form.waitForErrorBox();
    await t.expect(pageObject.form.getErrorBoxText()).eql('We found some errors. Please review the form and make corrections.');
  });
