import { RequestMock, userVariables } from 'testcafe';
import { checkA11y } from '../framework/a11y';
import terminalReturnEmail from '../../../playground/mocks/data/idp/idx/terminal-return-email';
import terminalTransferEmail from '../../../playground/mocks/data/idp/idx/terminal-transfered-email';
import terminalReturnExpiredEmail from '../../../playground/mocks/data/idp/idx/terminal-return-expired-email';
import terminalRegistrationEmail from '../../../playground/mocks/data/idp/idx/terminal-registration';
import terminalReturnEmailConsentDenied from '../../../playground/mocks/data/idp/idx/terminal-enduser-email-consent-denied';
import TerminalPageObject from '../framework/page-objects/TerminalPageObject';
import TerminalPageObjectV3 from '../framework/page-objects/TerminalPageObjectV3';
import sessionExpired from '../../../playground/mocks/data/idp/idx/error-401-session-expired';
import noPermissionForAction from '../../../playground/mocks/data/idp/idx/error-403-security-access-denied';
import pollingExpired from '../../../playground/mocks/data/idp/idx/terminal-polling-window-expired';
import unlockFailed from '../../../playground/mocks/data/idp/idx/error-unlock-account';
import accessDeniedOnOtherDeivce from '../../../playground/mocks/data/idp/idx/terminal-return-email-consent-denied';
import terminalUnlockAccountFailedPermissions from '../../../playground/mocks/data/idp/idx/error-unlock-account-failed-permissions';
import errorTerminalMultipleErrors from '../../../playground/mocks/data/idp/idx/error-terminal-multiple-errors';
import customAccessDeniedErrorMessage from '../../../playground/mocks/data/idp/idx/error-identify-access-denied-custom-message.json';
import endUserRemediationOneOption from '../../../playground/mocks/data/idp/idx/end-user-remediation-one-option.json';
import endUserRemediationMultipleOptions from '../../../playground/mocks/data/idp/idx/end-user-remediation-multiple-options.json';
import endUserRemediationMultipleOptionsWithCustomHelpUrl from '../../../playground/mocks/data/idp/idx/end-user-remediation-multiple-options-with-custom-help-url.json';
import endUserRemediationNoOptions from '../../../playground/mocks/data/idp/idx/end-user-remediation-no-options.json';
import { within } from '@testing-library/testcafe';

const terminalTransferredEmailMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(terminalTransferEmail);

const terminalMultipleErrorsMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(errorTerminalMultipleErrors);

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

const terminalCustomAccessDeniedErrorMessageMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(customAccessDeniedErrorMessage);

const endUserRemediationOneOptionMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(endUserRemediationOneOption);

const endUserRemediationMultipleOptionsMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(endUserRemediationMultipleOptions);

const endUserRemediationMultipleOptionsWithCustomHelpUrlMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(endUserRemediationMultipleOptionsWithCustomHelpUrl);  

const endUserRemediationNoOptionsMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(endUserRemediationNoOptions);  

fixture('Terminal view');

async function setup(t) {
  const terminalPageObject = userVariables.gen3 ? new TerminalPageObjectV3(t) : new TerminalPageObject(t);
  await terminalPageObject.navigateToPage();
  // ensure form has loaded
  await t.expect(terminalPageObject.formExists()).eql(true);
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
].forEach(([ testTitle, mock ]) => {
  test
    .requestHooks(mock)(testTitle, async t => {
      const terminalViewPage = await setup(t);
      await checkA11y(t);
      await t.expect(terminalViewPage.getBeaconClass()).contains('mfa-okta-email');
    });
});

// Terminal screens with user context should display identifier in the user remediation object
[
  [ 'Shows user identifier for terminal return to original tab scenario for email',
    terminalReturnEmailMock ],
  [ 'Shows user identifier for terminal registration email',
    terminalRegistrationEmailMock ],
  [ 'Shows user identifier for terminal unlock account failed because of permissions',
    terminalUnlockAccountFailedPermissionsMock ],
].forEach(([ testTitle, mock ]) => {
  test
    .requestHooks(mock)(testTitle, async t => {
      const terminalViewPage = await setup(t);
      await checkA11y(t);
      await t.expect(terminalViewPage.getIdentifier()).contains('testUser@okta.com');
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
      await checkA11y(t);
      await t.expect(await terminalViewPage.goBackLinkExists()).ok();
    });
});

// Adds a check to test if back to sign in link is not required in some terminal states.
// This should be added in respective test class for the flow
[
  ['should not have Back to sign in link when flow continued in new tab', terminalTransferredEmailMock],
  ['should not have Back to sign in link when access denied on other device', accessDeniedOnOtherDeivceMock],
].forEach(([ testTitle, mock ]) => {
  test
    .requestHooks(mock)(testTitle, async t => {
      const terminalViewPage = await setup(t);
      await checkA11y(t);
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
      await checkA11y(t);
      if(!userVariables.gen3) {
        await t.expect(await terminalViewPage.goBackLinkExists()).notOk();
      }
      await t.expect(await terminalViewPage.signoutLinkExists()).ok();
    });
});

test.requestHooks(terminalMultipleErrorsMock)('should render each error message when there are multiple', async t => {
  const terminalViewPage = await setup(t);
  await checkA11y(t);

  await t.expect(await terminalViewPage.form.getErrorBoxTextByIndex(0)).eql('Please enter a username');
  await t.expect(await terminalViewPage.form.getErrorBoxTextByIndex(1)).eql('Please enter a password');
  await t.expect(await terminalViewPage.form.getErrorBoxTextByIndex(2)).eql('Your session has expired. Please try to sign in again.');
});

test.requestHooks(terminalCustomAccessDeniedErrorMessageMock)('should render custom access denied error message', async t => {
  const terminalViewPage = await setup(t);
  await checkA11y(t);
  const errorBox = userVariables.gen3 ? terminalViewPage.form.getErrorBox() : terminalViewPage.form.getErrorBoxCallout();
  await t.expect(errorBox.innerText).contains('You do not have permission to perform the requested action.');

  const errorLink1 = within(errorBox).getByRole('link', {name: 'Help link 1'});
  const errorLink2 = within(errorBox).getByRole('link', {name: 'Help link 2'});

  await t.expect(errorLink1.exists).eql(true);
  await t.expect(errorLink1.getAttribute('href')).eql('https://www.okta.com/');

  await t.expect(errorLink2.exists).eql(true);
  await t.expect(errorLink2.getAttribute('href')).eql('https://www.okta.com/help?page=1');
});

test.requestHooks(endUserRemediationOneOptionMock)('should render end user remediation error message when there is one option', async t => {
  const terminalViewPage = await setup(t);
  await checkA11y(t);

  await t.expect(terminalViewPage.form.getErrorBoxCallout().withText('Your device doesn\'t meet the security requirements').exists).eql(true);
  await t.expect(terminalViewPage.form.getErrorBoxCallout().withText('To sign in, make the following updates. Then, access the app again.').exists).eql(true);

  await t.expect(terminalViewPage.form.getErrorBoxAnchor('https://okta.com/android-upgrade-os').withExactText('Update to Android 100').exists).eql(true);
  await t.expect(terminalViewPage.form.getErrorBoxAnchor('https://okta.com/android-biometric-lock').withExactText('Enable lock screen and biometrics').exists).eql(true);

  await t.expect(terminalViewPage.form.getErrorBoxCallout().withText('follow the instructions on the help page').find('a[href="https://okta.com/help"]').exists).eql(true);
  await t.expect(terminalViewPage.form.getAnchorsWithBlankTargetsWithoutRelevantAttributes().exists).eql(false);
});

test.requestHooks(endUserRemediationMultipleOptionsMock)('should render end user remediation error message when there are multiple options', async t => {
  const terminalViewPage = await setup(t);
  await checkA11y(t);

  await t.expect(terminalViewPage.form.getErrorBoxCallout().withText('Your device doesn\'t meet the security requirements').exists).eql(true);
  await t.expect(terminalViewPage.form.getErrorBoxCallout().withText('To sign in, pick an option and make the updates. Then, access the app again.').exists).eql(true);

  await t.expect(terminalViewPage.form.getErrorBoxAnchor('https://okta.com/android-upgrade-os').withExactText('Update to Android 100').exists).eql(true);
  await t.expect(terminalViewPage.form.getErrorBoxAnchor('https://okta.com/android-biometric-lock').withExactText('Enable lock screen and biometrics').exists).eql(true);

  await t.expect(terminalViewPage.form.getErrorBoxAnchor('https://okta.com/android-lock-screen').withExactText('Enable lock screen').exists).eql(true);
  await t.expect(terminalViewPage.form.getErrorBoxAnchor('https://okta.com/android-disk-encrypted').withExactText('Encrypt your device').exists).eql(true);

  await t.expect(terminalViewPage.form.getErrorBoxCallout().withText('follow the instructions on the help page').find('a[href="https://okta.com/help"]').exists).eql(true);
  await t.expect(terminalViewPage.form.getAnchorsWithBlankTargetsWithoutRelevantAttributes().exists).eql(false);
});

test.requestHooks(endUserRemediationMultipleOptionsWithCustomHelpUrlMock)('should render end user remediation error message when there are multiple options and a custom URL is set for the organization help page', async t => {
  const terminalViewPage = await setup(t);
  await checkA11y(t);

  // The body of the API response is not normally returned for multiple different
  // platforms. The test exists to ensure all of the expected keys can be
  // localized
  await t.expect(terminalViewPage.form.getErrorBoxCallout().withText('Your device doesn\'t meet the security requirements').exists).eql(true);
  await t.expect(terminalViewPage.form.getErrorBoxCallout().withText('To sign in, pick an option and make the updates. Then, access the app again.').exists).eql(true);

  await t.expect(terminalViewPage.form.getErrorBoxAnchor('https://okta.com/ios-upgrade-os').withExactText('Update to iOS 12.0.1').exists).eql(true);
  await t.expect(terminalViewPage.form.getErrorBoxAnchor('https://okta.com/ios-lock-screen').withExactText('Set a passcode for the lock screen').exists).eql(true);
  await t.expect(terminalViewPage.form.getErrorBoxAnchor('https://okta.com/ios-biometric-lock').withExactText('Set a passcode for the lock screen and enable Touch ID or Face ID').exists).eql(true);

  await t.expect(terminalViewPage.form.getErrorBoxAnchor('https://okta.com/macos-upgrade-os').withExactText('Update to macOS 13.2').exists).eql(true);
  await t.expect(terminalViewPage.form.getErrorBoxAnchor('https://okta.com/macos-lock-screen').withExactText('Set a passcode for the lock screen').exists).eql(true);
  await t.expect(terminalViewPage.form.getErrorBoxAnchor('https://okta.com/macos-disk-encrypted').withExactText('Turn on FileVault').exists).eql(true);

  await t.expect(terminalViewPage.form.getErrorBoxAnchor('https://okta.com/windows-upgrade-os').withExactText('Update to Windows 10.0.25530.123').exists).eql(true);
  await t.expect(terminalViewPage.form.getErrorBoxAnchor('https://okta.com/windows-disk-encrypted').withExactText('Encrypt all internal disks with BitLocker').exists).eql(true);

  await t.expect(terminalViewPage.form.getErrorBoxAnchor('https://okta.com/windows-biometric-lock').withExactText('Enable Windows Hello for the lock screen').exists).eql(true);

  await t.expect(terminalViewPage.form.getErrorBoxCallout().withText('follow the instructions on your organization\'s help page').find('a[href="https://okta1.com/custom-help-me"]').exists).eql(true);
  await t.expect(terminalViewPage.form.getAnchorsWithBlankTargetsWithoutRelevantAttributes().exists).eql(false);
});

test.requestHooks(endUserRemediationNoOptionsMock)('should render end user remediation error message when there are no options', async t => {
  const terminalViewPage = await setup(t);
  await checkA11y(t);

  await t.expect(terminalViewPage.form.getErrorBoxCallout().withText('Your device doesn\'t meet the security requirements').exists).eql(true);
  await t.expect(terminalViewPage.form.getErrorBoxCallout().withText('To sign in, make the following updates. Then, access the app again.').exists).eql(false);

  await t.expect(terminalViewPage.form.getErrorBoxCallout().withText('follow the instructions on your organization\'s help page').find('a[href="https://okta1.com/custom-help-me"]').exists).eql(true);
  await t.expect(terminalViewPage.form.getAnchorsWithBlankTargetsWithoutRelevantAttributes().exists).eql(false);
});
