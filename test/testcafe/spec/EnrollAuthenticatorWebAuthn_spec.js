import { RequestMock } from 'testcafe';
import EnrollWebauthnPageObject from '../framework/page-objects/EnrollWebauthnPageObject';
import xhrAuthenticatorEnrollWebauthn from '../../../playground/mocks/data/idp/idx/authenticator-enroll-webauthn';
import xhrSuccess from '../../../playground/mocks/data/idp/idx/success';

const mock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollWebauthn)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(xhrSuccess);

fixture(`Enroll Webauthn Authenticator`)
  .requestHooks(mock);

async function setup(t) {
  const enrollWebauthnPage = new EnrollWebauthnPageObject(t);
  await enrollWebauthnPage.navigateToPage();
  return enrollWebauthnPage;
}

// This is the only test we can perfrom in testcafe as webauthn api is not available in the version of chrome/chromeheadless
// that testcafe loads.
test(`should have webauthn not supported error if browser doesnt support`, async t => {
  const enrollWebauthnPage = await setup(t);
  await t.expect(enrollWebauthnPage.getFormTitle()).eql('Set up security key or biometric authenticator');
  await t.expect(enrollWebauthnPage.hasEnrollInstruction()).eql(false);
  await t.expect(enrollWebauthnPage.hasWebauthnNotSupportedError()).eql(true);

  // no signout link at enroll page
  await t.expect(await enrollWebauthnPage.signoutLinkExists()).notOk();

  // assert switch authenticator link shows up
  await t.expect(await enrollWebauthnPage.switchAuthenticatorLinkExists()).ok();
  await t.expect(enrollWebauthnPage.getSwitchAuthenticatorLinkText()).eql('Sign in using something else');
});
