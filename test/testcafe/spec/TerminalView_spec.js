import { RequestMock } from 'testcafe';
import terminalReturnEmail from '../../../playground/mocks/data/idp/idx/terminal-return-email';
import terminalTransferEmail from '../../../playground/mocks/data/idp/idx/terminal-transfered-email';
import terminalReturnExpiredEmail from '../../../playground/mocks/data/idp/idx/terminal-return-expired-email';
import terminalRegistrationEmail from '../../../playground/mocks/data/idp/idx/terminal-registration';
import terminalReturnEmailConsentDenied from '../../../playground/mocks/data/idp/idx/terminal-enduser-email-consent-denied';
import TerminalPageObject from '../framework/page-objects/TerminalPageObject';
import sessionExpired from '../../../playground/mocks/data/idp/idx/error-session-expired';
import noPermissionForAction from '../../../playground/mocks/data/idp/idx/error-403-security-access-denied';
import pollingExpired from '../../../playground/mocks/data/idp/idx/terminal-polling-window-expired';
import unlockFailed from '../../../playground/mocks/data/idp/idx/error-unlock-account';
import accessDeniedOnOtherDeivce from '../../../playground/mocks/data/idp/idx/terminal-return-email-consent-denied';
import terminalUnlockAccountFailedPermissions from '../../../playground/mocks/data/idp/idx/error-unlock-account-failed-permissions';
import terminalReturnOtpOnly from '../../../playground/mocks/data/idp/idx/terminal-return-otp-only';
import terminalReturnOtpOnlyNoLocation from '../../../playground/mocks/data/idp/idx/terminal-return-otp-only-no-location';

const terminalTransferredEmailMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(terminalTransferEmail);

const terminalReturnEmailMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(terminalReturnEmail);

const terminalReturnExpiredEmailMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(terminalReturnExpiredEmail);

const terminalRegistrationEmailMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(terminalRegistrationEmail);

const terminalReturnEmailConsentDeniedMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(terminalReturnEmailConsentDenied);

const sessionExpiredMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(sessionExpired);

const noPermissionForActionMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(noPermissionForAction);

const pollingExpiredMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(pollingExpired);

const unlockFailedMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(unlockFailed);

const accessDeniedOnOtherDeivceMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(accessDeniedOnOtherDeivce);

const terminalUnlockAccountFailedPermissionsMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(terminalUnlockAccountFailedPermissions);

const terminalReturnOtpOnlyMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(terminalReturnOtpOnly);

const terminalReturnOtpOnlyNoLocationMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(terminalReturnOtpOnlyNoLocation);

// OTP Only View constants
function getOtpOnlyIconSelector(fieldName) {
  return `[class='enduser-email-consent--icon icon--${fieldName}']`;
}

const BROWSER_OS_ICON_SELECTOR = getOtpOnlyIconSelector('desktop');
const APP_ICON_SELECTOR = getOtpOnlyIconSelector('app');
const GEOLOCATION_ICON_SELECTOR = getOtpOnlyIconSelector('location');
const OTP_VALUE_SELECTOR = `[class='otp-value']`;

fixture('Terminal view');

async function setup(t) {
  const terminalPageObject = new TerminalPageObject(t);
  await terminalPageObject.navigateToPage();
  return terminalPageObject;
}

[
  [ 'Shows the correct beacon for trasferred to new tab scenario for email terminalview',
    terminalTransferredEmailMock ],
  [ 'Shows the correct beacon for return to original tab scenario for email terminalview',
    terminalReturnEmailMock ],
  [ 'Shows the correct beacon for expired email terminalview',
    terminalReturnExpiredEmailMock ],
  [ 'Shows the correct beacon for email sent terminalview',
    terminalRegistrationEmailMock ],
  [ 'Shows the correct beacon for terminal email consent denied screen in first device',
    terminalReturnEmailConsentDeniedMock ],
  [ 'Shows correct beacon for OTP info page in email magic link flow',
    terminalReturnOtpOnlyMock ],
  [ 'Shows correct beacon for OTP info page (w/out geolocation) in email magic link flow',
    terminalReturnOtpOnlyNoLocationMock ],
].forEach(([ testTitle, mock ]) => {
  test
    .requestHooks(mock)(testTitle, async t => {
      const terminalViewPage = await setup(t);
      await t.expect(terminalViewPage.getBeaconClass()).contains('mfa-okta-email');
    });
});

// Generally all terminal states should have Back to sign in link.
// No need to add tests for each view here, respective test class for the flow should test it.
[
  ['should have Back to sign in link when session expires', sessionExpiredMock],
  ['should have Back to sign in link when operation cancelled', terminalReturnEmailConsentDeniedMock],
  ['should have Back to sign in link when access denied', noPermissionForActionMock],
  ['should have Back to sign in link when polling window expired', pollingExpiredMock],
  ['should have Back to sign in link when unlock account failed', unlockFailedMock],
].forEach(([ testTitle, mock ]) => {
  test
    .requestHooks(mock)(testTitle, async t => {
      const terminalViewPage = await setup(t);
      await t.expect(await terminalViewPage.goBackLinkExists()).ok();
    });
});

// Adds a check to test if back to sign in link is not required in some terminal states.
// This should be added in respective test class for the flow
[
  ['should not have Back to sign in link when flow continued in new tab', terminalTransferredEmailMock],
  ['should not have Back to sign in link when access denied on other device', accessDeniedOnOtherDeivceMock],
  ['Should not have Back to sign in link when OTP info page is accessed', terminalReturnOtpOnlyMock ],
  ['Should not have Back to sign in link when OTP info page (w/out location) is accessed', terminalReturnOtpOnlyNoLocationMock ],
].forEach(([ testTitle, mock ]) => {
  test
    .requestHooks(mock)(testTitle, async t => {
      const terminalViewPage = await setup(t);
      await t.expect(await terminalViewPage.goBackLinkExists()).notOk();
    });
});

// Back to sign in link is added based on IDX response and not added by default
[
  ['should have Back to sign in link from response to cancel when unlock account failed due to permission', terminalUnlockAccountFailedPermissionsMock],
].forEach(([ testTitle, mock ]) => {
  test
    .requestHooks(mock)(testTitle, async t => {
      const terminalViewPage = await setup(t);
      await t.expect(await terminalViewPage.goBackLinkExists()).notOk();
      await t.expect(await terminalViewPage.signoutLinkExists()).ok();
    });
});

// Make sure geolocation is only displayed on OTP Only page when present in response
[
  ['Should have entry for geolocation on OTP info page when accessed', terminalReturnOtpOnlyMock, true],
  ['Should not have entry for geolocation on OTP info page (w/out location) when accessed', terminalReturnOtpOnlyNoLocationMock, false],
].forEach(([testTitle, mock, expectedValue]) => {
  test
    .requestHooks(mock)(testTitle, async t => {
      const terminalViewPage = await setup(t);
      // Make sure OTP, Browser & OS, App Name are present
      await t.expect(await terminalViewPage.elementExist(OTP_VALUE_SELECTOR)).ok();
      await t.expect(await terminalViewPage.elementExist(BROWSER_OS_ICON_SELECTOR)).ok();
      await t.expect(await terminalViewPage.elementExist(APP_ICON_SELECTOR)).ok();
      // Ensure geolocation's presence or not based on response
      expectedValue ?
        await t.expect(await terminalViewPage.elementExist(GEOLOCATION_ICON_SELECTOR)).ok() :
        await t.expect(await terminalViewPage.elementExist(GEOLOCATION_ICON_SELECTOR)).notOk();
    });
});
