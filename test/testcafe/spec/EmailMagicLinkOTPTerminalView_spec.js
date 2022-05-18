import { RequestMock } from 'testcafe';
import terminalReturnOtpOnlyFullLocation from '../../../playground/mocks/data/idp/idx/terminal-return-otp-only-full-location.json';
import terminalReturnOtpOnlyPartialLocation from '../../../playground/mocks/data/idp/idx/terminal-return-otp-only-partial-location.json';
import terminalReturnOtpOnlyNoLocation from '../../../playground/mocks/data/idp/idx/terminal-return-otp-only-no-location.json';
import terminalReturnOtpOnlyFullLocationMobileIconAuthentication from '../../../playground/mocks/data/idp/idx/terminal-return-otp-only-full-location-mobile-icon-authentication.json';
import terminalReturnOtpOnlyFullLocationMobileIconEnrollment from '../../../playground/mocks/data/idp/idx/terminal-return-otp-only-full-location-mobile-icon-enrollment.json';
import terminalReturnOtpOnlyFullLocationMobileIconRecovery from '../../../playground/mocks/data/idp/idx/terminal-return-otp-only-full-location-mobile-icon-recovery.json';
import terminalReturnOtpOnlyFullLocationMobileIconUnlock from '../../../playground/mocks/data/idp/idx/terminal-return-otp-only-full-location-mobile-icon-unlock.json';
import terminalReturnOtpUnexpectedResponse from '../../../playground/mocks/data/idp/idx/terminal-return-otp-unexpected-response.json';
import TerminalOtpOnlyPageObject from '../framework/page-objects/TerminalOtpOnlyPageObject';

const terminalReturnOtpOnlyFullLocationMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(terminalReturnOtpOnlyFullLocation);

const terminalReturnOtpOnlyNoLocationMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(terminalReturnOtpOnlyNoLocation);

const terminalReturnOtpOnlyPartialLocationMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(terminalReturnOtpOnlyPartialLocation);

const terminalReturnOtpOnlyFullLocationMobileIconAuthenticationMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(terminalReturnOtpOnlyFullLocationMobileIconAuthentication);

const terminalReturnOtpOnlyFullLocationMobileIconEnrollmentMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(terminalReturnOtpOnlyFullLocationMobileIconEnrollment);

const terminalReturnOtpOnlyFullLocationMobileIconRecoveryMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(terminalReturnOtpOnlyFullLocationMobileIconRecovery);

const terminalReturnOtpOnlyFullLocationMobileIconUnlockMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(terminalReturnOtpOnlyFullLocationMobileIconUnlock);

const terminalReturnOtpUnexpectedResponseyMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(terminalReturnOtpUnexpectedResponse);

fixture('Email Magic Link OTP Terminal view');

async function setupOtpOnly(t) {
  const terminalOtpOnlyPageObject = new TerminalOtpOnlyPageObject(t);
  await terminalOtpOnlyPageObject.navigateToPage();
  return terminalOtpOnlyPageObject;
}

// Testing to make sure email beacon is rendered
[
  ['Shows correct beacon for OTP info page in email magic link flow',
    terminalReturnOtpOnlyFullLocationMock],
  ['Shows correct beacon for OTP info page (w/ partial geolocation) in email magic link flow',
    terminalReturnOtpOnlyNoLocationMock],
  ['Shows correct beacon for OTP info page (w/out geolocation) in email magic link flow',
    terminalReturnOtpOnlyNoLocationMock],
].forEach(([testTitle, mock]) => {
  test
    .requestHooks(mock)(testTitle, async t => {
      const terminalViewPage = await setupOtpOnly(t);
      await t.expect(terminalViewPage.getBeaconClass()).contains('mfa-okta-email');
    });
});

// Testing to make sure there is no 'back to sign in' link on the page
[
  ['Should not have Back to sign in link when OTP info page is accessed', terminalReturnOtpOnlyFullLocationMock],
  ['Should not have Back to sign in link when OTP info page (w/ partial location) is accessed', terminalReturnOtpOnlyPartialLocationMock],
  ['Should not have Back to sign in link when OTP info page (w/out location) is accessed', terminalReturnOtpOnlyNoLocationMock],
].forEach(([testTitle, mock]) => {
  test
    .requestHooks(mock)(testTitle, async t => {
      const terminalViewPage = await setupOtpOnly(t);
      await t.expect(await terminalViewPage.goBackLinkExists()).notOk();
    });
});

// Make sure geolocation is only displayed on OTP Only page when present in response
[
  ['Should have entry for geolocation on OTP info page when accessed', terminalReturnOtpOnlyFullLocationMock, 'Toronto, Ontario, Canada'],
  ['Should have entry for geolocation on OTP info page (w/ partial location info) when accessed', terminalReturnOtpOnlyPartialLocationMock, 'Toronto, Canada'],
  ['Should not have entry for geolocation on OTP info page (w/out location) when accessed', terminalReturnOtpOnlyNoLocationMock, null],
].forEach(([testTitle, mock, expectingGeolocation]) => {
  test
    .requestHooks(mock)(testTitle, async t => {
      const terminalOtpOnlyPage = await setupOtpOnly(t);
      // Make sure OTP, Browser & OS, App Name are present and correct
      await t.expect(await terminalOtpOnlyPage.doesOtpEntryExist()).ok();
      await t.expect(await terminalOtpOnlyPage.doesBrowserOsIconExist()).ok();
      await t.expect(await terminalOtpOnlyPage.doesAppIconExist()).ok();
      await t.expect(terminalOtpOnlyPage.getAppNameElement().innerText).contains('my 3rd magic link spa');
      await t.expect(terminalOtpOnlyPage.getBrowserOsElement().innerText).eql('FIREFOX on Mac OS X');
      await t.expect(terminalOtpOnlyPage.getOtpEntry().innerText).eql('123456');

      // Ensure geolocation's presence & value or not based on response
      if (expectingGeolocation) {
        await t.expect(await terminalOtpOnlyPage.doesGeolocationIconExist()).ok();
        await t.expect(terminalOtpOnlyPage.getGeolocationElement().innerText).eql(expectingGeolocation);
      } else {
        await t.expect(await terminalOtpOnlyPage.doesGeolocationIconExist()).notOk();
      }
    });
});

// Make sure form title, otp-only warning have updated wording, user email and mobile icon are present in the response
[
  ['Should have entry for enter code on sign in page and mobile icon (Android) when accessed', terminalReturnOtpOnlyFullLocationMobileIconAuthenticationMock, 'Enter this code on the sign-in page.'],
  ['Should have entry for enter code on password reset page and mobile icon (Android) when accessed', terminalReturnOtpOnlyFullLocationMobileIconRecoveryMock, 'Enter this code on the password reset page.'],
  ['Should have entry for enter code on account unlock page and mobile icon (iOS) when accessed', terminalReturnOtpOnlyFullLocationMobileIconUnlockMock, 'Enter this code on the account unlock page.'],
  ['Should have entry for enter code on registration page and mobile icon (iOS) when accessed', terminalReturnOtpOnlyFullLocationMobileIconEnrollmentMock, 'Enter this code on the sign up page.'],
].forEach(([testTitle, mock, intent]) => {
  test
    .requestHooks(mock)(testTitle, async t => {
      const terminalOtpOnlyPage = await setupOtpOnly(t);
      await t.expect(await terminalOtpOnlyPage.doesFormTitleExist()).ok();
      await t.expect(await terminalOtpOnlyPage.doesUserEmailExist()).ok();
      await t.expect(await terminalOtpOnlyPage.doesEnterCodeOnPageExist()).ok();
      await t.expect(await terminalOtpOnlyPage.doesBrowserOsSmartphoneIconExist()).ok();
      await t.expect(terminalOtpOnlyPage.getFormTitleElement().innerText).eql('Your verification code');
      await t.expect(terminalOtpOnlyPage.getUserEmailElement().innerText).eql('test@okta.com');
      await t.expect(terminalOtpOnlyPage.getEnterCodeOnPageElement().innerText).eql(intent);
    });
});

// Confirms fix for OKTA-495883
test.requestHooks(terminalReturnOtpUnexpectedResponseyMock)('should gracefully handle unexpected idx response and render a default message', async t => {
  // broken message: L10N_ERROR[idx.return.link.otponly.enter.code.on.page]
  const terminalOtpOnlyPage = await setupOtpOnly(t);
  await t.expect(await terminalOtpOnlyPage.doesEnterCodeOnPageExist()).ok();
  await t.expect(terminalOtpOnlyPage.getEnterCodeOnPageElement().innerText).notContains('L10N_ERROR');
});
