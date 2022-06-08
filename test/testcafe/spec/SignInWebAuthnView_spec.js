import { RequestLogger, RequestMock, Selector } from 'testcafe';
import SignInWebAuthnPageObject from '../framework/page-objects/SignInWebAuthnPageObject';
import identifyWithWebAuthn from '../../../playground/mocks/data/idp/idx/identify-with-webauthn-residentkey';
import launchWebAuthnOption from '../../../playground/mocks/data/idp/idx/identify-with-webauthn-launch-authenticator';

const logger = RequestLogger(/introspect/);

const mock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(identifyWithWebAuthn)
  .onRequestTo('http://localhost:3000/idp/idx/authenticators/webauthn/launch')
  .respond(launchWebAuthnOption);

fixture('Sign in with Okta Verify is required')
  .requestHooks(logger, mock);

async function setup(t) {
  const signInWebAuthnPageObject = new SignInWebAuthnPageObject(t);
  await signInWebAuthnPageObject.navigateToPage();
  return signInWebAuthnPageObject;
}

test('shows sign in with webauthn button', async t => {
  const signInWebAuthnPage = await setup(t);
  await t.expect(signInWebAuthnPage.getWebAuthnButtonIcon()).eql('icon okta-webauthn-authenticator');
  await t.expect(signInWebAuthnPage.getWebAuthnButtonLabel()).eql('Sign in with security key or biometric');
});

test('clicking the sign in with webauthn button takes user to the right UI', async t => {
  const signInWebAuthnPage = await setup(t);
  await signInWebAuthnPage.clickLaunchWebAuthnButton();
  const header = new Selector('h2[data-se="o-form-head"]');
  await t.expect(header.textContent).eql('Verify with Security Key or Biometric Authenticator');
});
