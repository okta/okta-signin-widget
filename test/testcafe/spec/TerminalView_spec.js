import { RequestMock } from 'testcafe';
import { checkA11y } from '../framework/a11y';
import terminalReturnEmail from '../../../playground/mocks/data/idp/idx/terminal-return-email';
import terminalTransferEmail from '../../../playground/mocks/data/idp/idx/terminal-transfered-email';
import terminalReturnExpiredEmail from '../../../playground/mocks/data/idp/idx/terminal-return-expired-email';
import terminalRegistrationEmail from '../../../playground/mocks/data/idp/idx/terminal-registration';
import terminalReturnEmailConsentDenied from '../../../playground/mocks/data/idp/idx/terminal-enduser-email-consent-denied';
import TerminalPageObject from '../framework/page-objects/TerminalPageObject';
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
      await t.expect(await terminalViewPage.goBackLinkExists()).notOk();
      await t.expect(await terminalViewPage.signoutLinkExists()).ok();
    });
});

test.requestHooks(terminalMultipleErrorsMock)('should render each error message when there are multiple', async t => {
  const terminalViewPage = await setup(t);
  await checkA11y(t);

  const errors = terminalViewPage.form.getAllErrorBoxTexts();
  await t.expect(errors).eql([
    'Please enter a username',
    'Please enter a password',
    'Your session has expired. Please try to sign in again.'
  ]);
});

test.requestHooks(terminalCustomAccessDeniedErrorMessageMock)('should render custom access denied error message', async t => {
  const terminalViewPage = await setup(t);
  await checkA11y(t);

  await t.expect(terminalViewPage.form.getErrorBoxHtml()).eql('<span data-se="icon" class="icon error-16"></span><div class="custom-access-denied-error-message"><p>You do not have permission to perform the requested action.</p><ul class="custom-links"><li><a href="https://www.okta.com/" target="_blank" rel="noopener noreferrer">Help link 1</a></li><li><a href="https://www.okta.com/help?page=1" target="_blank" rel="noopener noreferrer">Help link 2</a></li></ul></div>');
});

const assertAnchorWithBlankTargetHaveCorrectRelAttribute = async (t, selector) => {
  await t.expect(
    selector
      .find('a[target="_blank"]')
      .filter((node) => {
        const relValues = (node.getAttribute('rel') || '').split(' ');
        return relValues.indexOf('noopener') < 0 || relValues.indexOf('noreferrer') < 0;
      })
      .exists).eql(false);
};

const assertSIWEndUserRemediationHeaders = async (t, terminalViewPage, explanationExists) => {
  await t.expect(terminalViewPage.form.getErrorBox().find('.end-user-remediation-title').withExactText('Your device doesn\'t meet the security requirements').exists).eql(true);
  await t.expect(terminalViewPage.form.getErrorBox().find('.end-user-remediation-explanation').withExactText('To sign in, make the following updates. Then, access the app again.').exists).eql(explanationExists);
};

const endUserRemediationActionFound = async (t, terminalViewPage, optionIndex, remediationActions) => {
  const anchors = terminalViewPage.form.getErrorBox()
    .find('.end-user-remediation-options')
    .child((node) => {
      let currentOptionIndex = 0;
      let prevNode = node.previousSibling;

      // Count the number of "Option N" siblings before the current node,
      // to figure out what position we are in
      while (prevNode) {
        if (prevNode.classList.contains('end-user-remediation-option')) {
          currentOptionIndex += 1;
        }
        prevNode = prevNode.previousSibling;
      }

      return currentOptionIndex === optionIndex;
    }, {optionIndex})
    .filter('.end-user-remediation-action')
    .child();

  // assert anchor count
  await t.expect(anchors.count).eql(remediationActions.length);

  // assert anchor order, text and url line up
  await t.expect(
    anchors
      .filter((node, index) => {
        return node.getAttribute('href') === remediationActions[index].url && node.innerText === remediationActions[index].text;
      }, {remediationActions})
      .count
  ).eql(remediationActions.length);
};

test.requestHooks(endUserRemediationOneOptionMock)('should render end user remediation error message when there is one option', async t => {
  const terminalViewPage = await setup(t);
  await checkA11y(t);

  assertSIWEndUserRemediationHeaders(t, terminalViewPage, true);
  await endUserRemediationActionFound(t, terminalViewPage, 0, [
    {url: 'https://okta.com/android-upgrade-os', text: 'Update to Android 100'},
    {url: 'https://okta.com/android-biometric-lock', text: 'Enable lock screen and biometrics'}
  ]);
  await t.expect(terminalViewPage.form.getErrorBox().find('div.end-user-remediation-help-and-contact').withText('follow the instructions on the help page').child('a[href="https://okta.com/help"]').exists).eql(true);
  await assertAnchorWithBlankTargetHaveCorrectRelAttribute(t, terminalViewPage.form.getErrorBox());
});

test.requestHooks(endUserRemediationMultipleOptionsMock)('should render end user remediation error message when there are multiple options', async t => {
  const terminalViewPage = await setup(t);
  await checkA11y(t);

  assertSIWEndUserRemediationHeaders(t, terminalViewPage, true);
  await endUserRemediationActionFound(t, terminalViewPage, 1, [
    {url: 'https://okta.com/android-upgrade-os', text: 'Update to Android 100'},
    {url: 'https://okta.com/android-biometric-lock', text: 'Enable lock screen and biometrics'}
  ]);
  await endUserRemediationActionFound(t, terminalViewPage, 2, [
    {url: 'https://okta.com/android-lock-screen', text: 'Enable lock screen'},
    {url: 'https://okta.com/android-disk-encrypted', text: 'Encrypt your device'}
  ]);
  await t.expect(terminalViewPage.form.getErrorBox().find('div.end-user-remediation-help-and-contact').withText('follow the instructions on the help page').child('a[href="https://okta.com/help"]').exists).eql(true);
  await assertAnchorWithBlankTargetHaveCorrectRelAttribute(t, terminalViewPage.form.getErrorBox());
});

test.requestHooks(endUserRemediationMultipleOptionsWithCustomHelpUrlMock)('should render end user remediation error message when there are multiple options and a custom URL is set for the organization help page', async t => {
  const terminalViewPage = await setup(t);
  await checkA11y(t);

  // The body of the API response is not normally returned for multiple different
  // platforms. The test exists to ensure all of the expected keys can be
  // localized
  assertSIWEndUserRemediationHeaders(t, terminalViewPage, true);
  await endUserRemediationActionFound(t, terminalViewPage, 1, [
    {url: 'https://okta.com/ios-upgrade-os', text: 'Update to iOS 12.0.1'},
    {url: 'https://okta.com/ios-lock-screen', text: 'Set a passcode for the lock screen'},
    {url: 'https://okta.com/ios-biometric-lock', text: 'Set a passcode for the lock screen and enable Touch ID or Face ID'},
  ]);
  await endUserRemediationActionFound(t, terminalViewPage, 2, [
    {url: 'https://okta.com/macos-upgrade-os', text: 'Update to macOS 13.2'},
    {url: 'https://okta.com/macos-lock-screen', text: 'Set a passcode for the lock screen'},
    {url: 'https://okta.com/macos-disk-encrypted', text: 'Turn on FileVault'},
  ]);
  await endUserRemediationActionFound(t, terminalViewPage, 3, [
    {url: 'https://okta.com/windows-upgrade-os', text: 'Update to Windows 10.0.25530.123'},
    {url: 'https://okta.com/windows-disk-encrypted', text: 'Encrypt all internal disks with BitLocker'},
  ]);
  await endUserRemediationActionFound(t, terminalViewPage, 4, [
    {url: 'https://okta.com/windows-biometric-lock', text: 'Enable Windows Hello for the lock screen'},
  ]);
  await t.expect(terminalViewPage.form.getErrorBox().find('div.end-user-remediation-help-and-contact').withText('follow the instructions on your organization\'s help page').child('a[href="https://okta1.com/custom-help-me"]').exists).eql(true);
  await assertAnchorWithBlankTargetHaveCorrectRelAttribute(t, terminalViewPage.form.getErrorBox());
});

test.requestHooks(endUserRemediationNoOptionsMock)('should render end user remediation error message when there are no options', async t => {
  const terminalViewPage = await setup(t);
  await checkA11y(t);

  assertSIWEndUserRemediationHeaders(t, terminalViewPage, false);
  await t.expect(terminalViewPage.form.getErrorBox().find('.end-user-remediation-options').count).eql(0);
  await t.expect(terminalViewPage.form.getErrorBox().find('.end-user-remediation-action').count).eql(0);
  await t.expect(terminalViewPage.form.getErrorBox().find('div.end-user-remediation-help-and-contact').withText('follow the instructions on your organization\'s help page').child('a[href="https://okta1.com/custom-help-me"]').exists).eql(true);
  await assertAnchorWithBlankTargetHaveCorrectRelAttribute(t, terminalViewPage.form.getErrorBox());
});
