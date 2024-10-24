import { RequestMock } from 'testcafe';
import { checkA11y } from '../framework/a11y';
import { oktaDashboardContent } from '../framework/shared';
import EnrollWebauthnPageObject from '../framework/page-objects/EnrollWebauthnPageObject';
import { checkConsoleMessages } from '../framework/shared';
import xhrAuthenticatorEnrollWebauthn from '../../../playground/mocks/data/idp/idx/authenticator-enroll-webauthn';
import xhrSuccess from '../../../playground/mocks/data/idp/idx/success';

const mock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollWebauthn)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(xhrSuccess)
  .onRequestTo(/^http:\/\/localhost:3000\/app\/UserHome.*/)
  .respond(oktaDashboardContent);

fixture('Enroll Webauthn Authenticator')
  .requestHooks(mock);

async function setup(t) {
  const enrollWebauthnPage = new EnrollWebauthnPageObject(t);
  await enrollWebauthnPage.navigateToPage();
  await t.expect(enrollWebauthnPage.formExists()).eql(true);
  await checkConsoleMessages({
    controller: 'enroll-webauthn',
    formName: 'enroll-authenticator',
    authenticatorKey: 'webauthn',
  });

  return enrollWebauthnPage;
}

// This is the only test we can perform in TestCafe without Native Automation as WebAuthn API is not available 
//  in the version of chrome/chromeheadless that TestCafe loads
test('should have webauthn not supported error if browser doesnt support', async t => {
  if (t.browser.nativeAutomation) {
    return;
  }

  const enrollWebauthnPage = await setup(t);
  await checkA11y(t);
  await t.expect(enrollWebauthnPage.getFormTitle()).eql('Set up security key or biometric authenticator');

  // check webauthn not supported error
  await t.expect(enrollWebauthnPage.hasEnrollInstruction()).eql(false);
  await t.expect(enrollWebauthnPage.getWebauthnNotSupportedError())
    .contains('Security key or biometric authenticator is not supported on this browser. Contact your admin for assistance.');  

  // signout link at enroll page
  await t.expect(await enrollWebauthnPage.signoutLinkExists()).ok();

  // assert switch authenticator link shows up
  await t.expect(await enrollWebauthnPage.returnToAuthenticatorListLinkExists()).ok();
  await t.expect(enrollWebauthnPage.getSwitchAuthenticatorLinkText()).eql('Return to authenticator list');
});

// TestCafe 3 with Native Automation enabled uses native CDP (Chrome DevTools Protocol) with enabled WebAuthn API
test('should show enroll instructions and setup button when browser supports webauthn', async t => {
  if (!t.browser.nativeAutomation) {
    return;
  }

  const enrollWebauthnPage = await setup(t);
  await checkA11y(t);
  await t.expect(enrollWebauthnPage.getFormTitle()).eql('Set up security key or biometric authenticator');

  // check enroll instructions and setup button
  await t.expect(enrollWebauthnPage.hasEnrollInstruction()).eql(true);
  await t.expect(await enrollWebauthnPage.hasWebauthnNotSupportedError()).notOk();
  await t.expect(enrollWebauthnPage.setupButtonExists()).eql(true);

  // signout link at enroll page
  await t.expect(await enrollWebauthnPage.signoutLinkExists()).ok();

  // assert switch authenticator link shows up
  await t.expect(await enrollWebauthnPage.returnToAuthenticatorListLinkExists()).ok();
  await t.expect(enrollWebauthnPage.getSwitchAuthenticatorLinkText()).eql('Return to authenticator list');
});
