import { RequestMock, RequestLogger } from 'testcafe';
import SuccessPageObject from '../framework/page-objects/SuccessPageObject';
import EnrollGoogleAuthenticatorPageObject from '../framework/page-objects/EnrollGoogleAuthenticatorPageObject';
import { checkConsoleMessages } from '../framework/shared';

import xhrEnrollGoogleAuthenticator from '../../../playground/mocks/data/idp/idx/authenticator-enroll-google-authenticator.json';
import success from '../../../playground/mocks/data/idp/idx/success';
import invalidOTP from '../../../playground/mocks/data/idp/idx/error-email-verify';

const logger = RequestLogger(/challenge\/poll|challenge\/answer|challenge\/resend/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
  }
);

const validOTPmock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrEnrollGoogleAuthenticator)
  .onRequestTo('http://localhost:3000/idp/idx/credential/enroll')
  .respond(xhrEnrollGoogleAuthenticator)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(success);

const invalidOTPMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrEnrollGoogleAuthenticator)
  .onRequestTo('http://localhost:3000/idp/idx/credential/enroll')
  .respond(xhrEnrollGoogleAuthenticator)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(invalidOTP, 403);


fixture('Enroll Google Authenticator');

async function setup(t) {
  const enrollGoogleAuthenticatorPageObject = new EnrollGoogleAuthenticatorPageObject(t);
  await enrollGoogleAuthenticatorPageObject.navigateToPage();
  await checkConsoleMessages({
    controller:null,
    formName:'enroll-authenticator',
    authenticatorKey:'google_otp',
    methodType: 'otp'
  });
  return enrollGoogleAuthenticatorPageObject;
}

test
  .requestHooks(invalidOTPMock)('enroll with Barcode with invalid OTP', async t => {
    const enrollGoogleAuthenticatorPageObject = await setup(t);


    await t.expect(enrollGoogleAuthenticatorPageObject.form.getTitle()).eql('Set up Google Authenticator');
    await t.expect(enrollGoogleAuthenticatorPageObject.isEnterCodeSubtitleVisible()).notOk();
    await t.expect(enrollGoogleAuthenticatorPageObject.getBarcodeSubtitle()).eql('Scan barcode');
    await t.expect(enrollGoogleAuthenticatorPageObject.getSetUpDescription())
      .eql('Launch Google Authenticator, tap the "+" icon, then select "Scan barcode".');
    await t.expect(enrollGoogleAuthenticatorPageObject.hasQRcode).ok();
    await enrollGoogleAuthenticatorPageObject.goToNextPage();

    await t.expect(enrollGoogleAuthenticatorPageObject.isEnterCodeSubtitleVisible()).ok();
    await enrollGoogleAuthenticatorPageObject.enterCode('123456');
    await enrollGoogleAuthenticatorPageObject.submit();

    await t.expect(enrollGoogleAuthenticatorPageObject.form.getErrorBoxText()).eql('Authentication failed');
  });

test
  .requestHooks(invalidOTPMock)('enroll with manual setup with invalid OTP', async t => {
    const enrollGoogleAuthenticatorPageObject = await setup(t);

    await enrollGoogleAuthenticatorPageObject.goTomanualSetup();
    await t.expect(enrollGoogleAuthenticatorPageObject.form.getTitle()).eql('Set up Google Authenticator');
    await t.expect(enrollGoogleAuthenticatorPageObject.isEnterCodeSubtitleVisible()).notOk();
    await t.expect(enrollGoogleAuthenticatorPageObject.getmanualSetupSubtitle()).eql('Can\'t scan barcode?');
    await t.expect(enrollGoogleAuthenticatorPageObject.getSharedSecret()).eql('ZR74DHZTG43NBULV');
    await enrollGoogleAuthenticatorPageObject.goToNextPage();

    await t.expect(enrollGoogleAuthenticatorPageObject.isEnterCodeSubtitleVisible()).ok();
    await enrollGoogleAuthenticatorPageObject.enterCode('123456');
    await enrollGoogleAuthenticatorPageObject.submit();

    await t.expect(enrollGoogleAuthenticatorPageObject.form.getErrorBoxText()).eql('Authentication failed');
  });

test
  .requestHooks(logger, validOTPmock)('enroll with Barcode with valid OTP', async t => {
    const enrollGoogleAuthenticatorPageObject = await setup(t);

    await t.expect(enrollGoogleAuthenticatorPageObject.form.getTitle()).eql('Set up Google Authenticator');
    await t.expect(enrollGoogleAuthenticatorPageObject.isEnterCodeSubtitleVisible()).notOk();
    await t.expect(enrollGoogleAuthenticatorPageObject.getBarcodeSubtitle()).eql('Scan barcode');
    await t.expect(enrollGoogleAuthenticatorPageObject.hasQRcode).ok();
    await enrollGoogleAuthenticatorPageObject.goToNextPage();

    await t.expect(enrollGoogleAuthenticatorPageObject.isEnterCodeSubtitleVisible()).ok();
    await enrollGoogleAuthenticatorPageObject.enterCode('123456');
    await enrollGoogleAuthenticatorPageObject.submit();

    const successPage = new SuccessPageObject(t);
    const pageUrl = await successPage.getPageUrl();
    await t.expect(pageUrl)
      .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
  });

test
  .requestHooks(logger, validOTPmock)('enroll with manual setup with valid OTP', async t => {
    const enrollGoogleAuthenticatorPageObject = await setup(t);

    await enrollGoogleAuthenticatorPageObject.goTomanualSetup();
    await t.expect(enrollGoogleAuthenticatorPageObject.form.getTitle()).eql('Set up Google Authenticator');
    await t.expect(enrollGoogleAuthenticatorPageObject.isEnterCodeSubtitleVisible()).notOk();
    await t.expect(enrollGoogleAuthenticatorPageObject.getmanualSetupSubtitle()).eql('Can\'t scan barcode?');
    await t.expect(enrollGoogleAuthenticatorPageObject.getSharedSecret()).eql('ZR74DHZTG43NBULV');
    await enrollGoogleAuthenticatorPageObject.goToNextPage();

    await t.expect(enrollGoogleAuthenticatorPageObject.isEnterCodeSubtitleVisible()).ok();
    await enrollGoogleAuthenticatorPageObject.enterCode('123456');
    await enrollGoogleAuthenticatorPageObject.submit();

    const successPage = new SuccessPageObject(t);
    const pageUrl = await successPage.getPageUrl();
    await t.expect(pageUrl)
      .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
  });
