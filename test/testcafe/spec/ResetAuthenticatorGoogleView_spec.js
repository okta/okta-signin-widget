import { RequestMock, RequestLogger } from 'testcafe';
import { checkA11y } from '../framework/a11y';
import { oktaDashboardContent } from '../framework/shared';
import FactorEnrollGoogleAuthenticatorPageObject from '../framework/page-objects/EnrollGoogleAuthenticatorPageObject.js';
import { checkConsoleMessages } from '../framework/shared';
import xhrAuthenticatorResetGoogle from '../../../playground/mocks/data/idp/idx/authenticator-reset-google';
import success from '@okta/mocks/data/idp/idx/success.json';
import SuccessPageObject from '../framework/page-objects/SuccessPageObject';
import xhrInvalidOTP from '@okta/mocks/data/idp/idx/error-authenticator-enroll-google-invalid-otp.json';

const logger = RequestLogger(/challenge\/answer/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
  }
);

const validOTPmock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorResetGoogle)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(success)
  .onRequestTo(/^http:\/\/localhost:3000\/app\/UserHome.*/)
  .respond(oktaDashboardContent);

const invalidOTPMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorResetGoogle)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(xhrInvalidOTP, 403);

fixture('Reset Google Authenticator');

async function setup(t) {
  const resetGAPage = new FactorEnrollGoogleAuthenticatorPageObject(t);
  await resetGAPage.navigateToPage();
  await t.expect(resetGAPage.formExists()).eql(true);
  await checkConsoleMessages({
    controller: null,
    formName: 'reset-authenticator',
    authenticatorKey: 'google_otp',
    methodType:'otp',
  });

  return resetGAPage;
}

test
  .requestHooks(invalidOTPMock)('enroll with Barcode with invalid OTP', async t => {
    const enrollGoogleAuthenticatorPageObject = await setup(t);
    await checkA11y(t);

    await t.expect(enrollGoogleAuthenticatorPageObject.form.getTitle()).eql('Set up Google Authenticator');
    await t.expect(enrollGoogleAuthenticatorPageObject.isEnterCodeSubtitleVisible()).notOk();
    await t.expect(enrollGoogleAuthenticatorPageObject.getBarcodeSubtitle()).eql('Scan QR code');
    await t.expect(enrollGoogleAuthenticatorPageObject.getSetUpDescription())
      .eql('Launch Google Authenticator, tap the "+" icon, then select "Scan a QR code".');
    await t.expect(enrollGoogleAuthenticatorPageObject.hasQRcode).ok();
    await t.expect(enrollGoogleAuthenticatorPageObject.getNextButton().exists).eql(true);
    await enrollGoogleAuthenticatorPageObject.goToNextPage();

    await t.expect(enrollGoogleAuthenticatorPageObject.isEnterCodeSubtitleVisible()).ok();
    await t.expect(await enrollGoogleAuthenticatorPageObject.getOtpLabel()).contains('Enter code');
    await enrollGoogleAuthenticatorPageObject.enterCode('123456');
    await enrollGoogleAuthenticatorPageObject.submit();

    await t.expect(enrollGoogleAuthenticatorPageObject.getCodeFieldError()).contains('Invalid code. Try again.');
    await t.expect(enrollGoogleAuthenticatorPageObject.form.getErrorBoxText()).contains('We found some errors.');
  });

test
  .requestHooks(invalidOTPMock)('enroll with manual setup with invalid OTP', async t => {
    const enrollGoogleAuthenticatorPageObject = await setup(t);
    await checkA11y(t);

    await enrollGoogleAuthenticatorPageObject.goTomanualSetup();
    await t.expect(enrollGoogleAuthenticatorPageObject.form.getTitle()).eql('Set up Google Authenticator');
    await t.expect(enrollGoogleAuthenticatorPageObject.isEnterCodeSubtitleVisible()).notOk();
    await t.expect(enrollGoogleAuthenticatorPageObject.getmanualSetupSubtitle()).contains('Can\'t scan');

    const sharedSecret = await enrollGoogleAuthenticatorPageObject.getSharedSecret();
    // Remove white spaces in string
    await t.expect(sharedSecret.toString().replace(/\s/g, '')).eql('ZR74DHZTG43NBULV');

    await t.expect(enrollGoogleAuthenticatorPageObject.getNextButton().exists).eql(true);
    await enrollGoogleAuthenticatorPageObject.goToNextPage();

    await t.expect(enrollGoogleAuthenticatorPageObject.isEnterCodeSubtitleVisible()).ok();
    await t.expect(await enrollGoogleAuthenticatorPageObject.getOtpLabel()).contains('Enter code');
    await enrollGoogleAuthenticatorPageObject.enterCode('123456');
    await enrollGoogleAuthenticatorPageObject.submit();

    await t.expect(enrollGoogleAuthenticatorPageObject.getCodeFieldError()).contains('Invalid code. Try again.');
    await t.expect(enrollGoogleAuthenticatorPageObject.form.getErrorBoxText()).contains('We found some errors.');
  });

test
  .requestHooks(logger, validOTPmock)('enroll with Barcode with valid OTP', async t => {
    const enrollGoogleAuthenticatorPageObject = await setup(t);
    await checkA11y(t);

    await t.expect(enrollGoogleAuthenticatorPageObject.form.getTitle()).eql('Set up Google Authenticator');
    await t.expect(enrollGoogleAuthenticatorPageObject.isEnterCodeSubtitleVisible()).notOk();
    await t.expect(enrollGoogleAuthenticatorPageObject.getBarcodeSubtitle()).eql('Scan QR code');
    await t.expect(enrollGoogleAuthenticatorPageObject.hasQRcode).ok();

    // Verify links (switch authenticator link is present even if there is just one authenticator available))
    await t.expect(await enrollGoogleAuthenticatorPageObject.returnToAuthenticatorListLinkExists()).ok();
    await t.expect(await enrollGoogleAuthenticatorPageObject.signoutLinkExists()).ok();
    await t.expect(enrollGoogleAuthenticatorPageObject.getNextButton().exists).eql(true);
    await t.expect(enrollGoogleAuthenticatorPageObject.getNextButton().visible).eql(true);

    await enrollGoogleAuthenticatorPageObject.goToNextPage();

    await t.expect(enrollGoogleAuthenticatorPageObject.isEnterCodeSubtitleVisible()).ok();
    await t.expect(await enrollGoogleAuthenticatorPageObject.getOtpLabel()).contains('Enter code');
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
    await checkA11y(t);

    await enrollGoogleAuthenticatorPageObject.goTomanualSetup();
    await t.expect(enrollGoogleAuthenticatorPageObject.form.getTitle()).eql('Set up Google Authenticator');
    await t.expect(enrollGoogleAuthenticatorPageObject.isEnterCodeSubtitleVisible()).notOk();
    await t.expect(enrollGoogleAuthenticatorPageObject.getmanualSetupSubtitle()).eql('Can\'t scan QR code?');
    const sharedSecret = await enrollGoogleAuthenticatorPageObject.getSharedSecret();
    // Remove white spaces in string
    await t.expect(sharedSecret.toString().replace(/\s/g, '')).eql('ZR74DHZTG43NBULV');
    await t.expect(enrollGoogleAuthenticatorPageObject.getNextButton().exists).eql(true);
    await enrollGoogleAuthenticatorPageObject.goToNextPage();

    // Verify links (switch authenticator link is present even if there is just one authenticator available))
    await t.expect(await enrollGoogleAuthenticatorPageObject.returnToAuthenticatorListLinkExists()).ok();
    await t.expect(await enrollGoogleAuthenticatorPageObject.signoutLinkExists()).ok();

    await t.expect(enrollGoogleAuthenticatorPageObject.isEnterCodeSubtitleVisible()).ok();
    await t.expect(await enrollGoogleAuthenticatorPageObject.getOtpLabel()).contains('Enter code');
    await enrollGoogleAuthenticatorPageObject.enterCode('123456');
    await enrollGoogleAuthenticatorPageObject.submit();

    const successPage = new SuccessPageObject(t);
    const pageUrl = await successPage.getPageUrl();
    await t.expect(pageUrl)
      .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
  });


