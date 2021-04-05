import { RequestMock, RequestLogger } from 'testcafe';
import SymantecAuthenticatorPageObject from '../framework/page-objects/SymantecAuthenticatorPageObject';
import { checkConsoleMessages } from '../framework/shared';
import xhrEnrollSymantecAuthenticator from '../../../playground/mocks/data/idp/idx/authenticator-enroll-symantec-vip';
import xhrVerifySymantecAuthenticator from '../../../playground/mocks/data/idp/idx/authenticator-verification-symantec-vip';
import xhrSuccess from '../../../playground/mocks/data/idp/idx/success';

const logger = RequestLogger(/introspect/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
  }
);

const enrollMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrEnrollSymantecAuthenticator)
  .onRequestTo('http://localhost:3000/idp/idx/credential/enroll')
  .respond(xhrEnrollSymantecAuthenticator)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(xhrSuccess);

const verifyMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrVerifySymantecAuthenticator)
  .onRequestTo('http://localhost:3000/idp/idx/challenge')
  .respond(xhrVerifySymantecAuthenticator)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(xhrSuccess);

async function setup(t) {
  const pageObject = new SymantecAuthenticatorPageObject(t);
  await pageObject.navigateToPage();

  return pageObject;
}

fixture('Enroll Symantec VIP Authenticator');
test
  .requestHooks(logger, enrollMock)('enroll with Symantec VIP authenticator', async t => {
    const pageObject = await setup(t);

    await checkConsoleMessages({
      controller: 'enroll-symantec',
      formName: 'enroll-authenticator',
      authenticatorKey:'symantec_vip',
      methodType: 'otp'
    });

    await t.expect(pageObject.getPageTitle()).eql('Set up Symantec VIP');
    await t.expect(pageObject.getPageSubtitle()).eql('From the Symantec VIP app, enter your credential ID and two consecutive generated codes');
    
    // Fill out form and submit
    await pageObject.verifyFactor('credentials.credentialId', '1234');
    await pageObject.verifyFactor('credentials.passcode', '1234');
    await pageObject.verifyFactor('credentials.nextPasscode', '1234');
    await pageObject.submit();

    const pageUrl = await pageObject.getPageUrl();
    await t.expect(pageUrl).eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
  });

test
  .requestHooks(logger, enrollMock)('enroll with Symantec VIP authenticator outputs form errors', async t => {
    const pageObject = await setup(t);

    await t.expect(pageObject.getPageTitle()).eql('Set up Symantec VIP');
    
    // Fill out only first part of the form and submit
    await pageObject.verifyFactor('credentials.credentialId', '1234');
    await pageObject.submit();

    pageObject.form.waitForErrorBox();
    await t.expect(pageObject.form.getErrorBoxText()).eql('We found some errors. Please review the form and make corrections.');
  });

fixture('Verify Symantec VIP Authenticator');
test
  .requestHooks(logger, verifyMock)('verify with Symantec VIP authenticator', async t => {
    const pageObject = await setup(t);

    await checkConsoleMessages({
      controller: 'mfa-verify',
      formName: 'challenge-authenticator',
      authenticatorKey:'symantec_vip',
      methodType: 'otp'
    });

    await t.expect(pageObject.getPageTitle()).eql('Verify with Symantec VIP');
    await t.expect(pageObject.getPageSubtitle()).eql('Enter the generated security code from the Symantec VIP app.');
    
    // Fill out form and submit
    await pageObject.verifyFactor('credentials.passcode', '1234');
    await pageObject.submit();

    const pageUrl = await pageObject.getPageUrl();
    await t.expect(pageUrl).eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
  });

test
  .requestHooks(logger, verifyMock)('verify with Symantec VIP authenticator outputs form errors', async t => {
    const pageObject = await setup(t);

    await t.expect(pageObject.getPageTitle()).eql('Verify with Symantec VIP');
    
    await pageObject.submit();

    pageObject.form.waitForErrorBox();
    await t.expect(pageObject.form.getErrorBoxText()).eql('We found some errors. Please review the form and make corrections.');
  });
