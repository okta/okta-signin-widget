import { RequestLogger, RequestMock } from 'testcafe';
import { checkA11y } from '../framework/a11y';
import SignInPasskeysPageObject from '../framework/page-objects/SignInPasskeysPageObject';
import introspect from '../../../playground/mocks/data/idp/idx/identify-with-passkeys-launch-authenticator';
import challengeResponse from '../../../playground/mocks/data/idp/idx/success-redirect-remediation';

const logger = RequestLogger(/introspect|webauthn-autofillui/);

const mock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(introspect)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer/webauthn-autofillui')
  .respond(challengeResponse);

fixture('Sign in with a passkey is required')
  .meta('gen3', false)
  .requestHooks(logger, mock);

async function setup(t) {
  const signInPasskeyPageObject = new SignInPasskeysPageObject(t);
  await signInPasskeyPageObject.navigateToPage();
  await t.expect(signInPasskeyPageObject.formExists()).ok();
  return signInPasskeyPageObject;
}

test('shows sign in with a passkey button', async t => {
  const signInPasskeyPage = await setup(t);
  await checkA11y(t);
  await t.expect(signInPasskeyPage.getPasskeyButtonIcon()).eql('icon okta-passkeys-authenticator');
  await t.expect(signInPasskeyPage.getPasskeyButtonLabel()).eql('Sign in with a passkey');
});

test('clicking the sign in with a passkey button takes user to the right UI', async t => {
  const signInPasskeyPage = await setup(t);
  await checkA11y(t);

  // Mock the navigator.credentials.get API
  await t.eval(() => {
    // Define helpers inside the browser context
    const base64ToBuffer = (b64) => {
      const bin = window.atob(b64.replace(/_/g, '/').replace(/-/g, '+'));
      return Uint8Array.from(bin, c => c.charCodeAt(0)).buffer;
    };

    const mockCredential = {
      authenticatorAttachment: 'platform',
      clientExtensionResults: { appid: false },
      id: 'LRJEPm_E05UKGzfQolU70QPBpmAuy9wuyh99u9jpnhw',
      rawId: base64ToBuffer('LRJEPm_E05UKGzfQolU70QPBpmAuy9wuyh99u9jpnhw'),
      response: {
        authenticatorData: base64ToBuffer('6OhQ2w2BmUNT_vEXt4tgGYrKhCHLCy0pEdVXow8H53kFAAAAAA'),
        clientDataJSON: base64ToBuffer('eyJ0eXBlIjoid2ViYXV0aG4uZ2V0IiwiY2hhbGxlbmdlIjoia1k4Q3ItR0NweHVFVkYyU3R5TE8yUjFsYXNXbWxqTEkiLCJvcmlnaW4iOiJodHRwczovL29pZS5sb2NhbC5zaWdtYW5ldGNvcnAudXMiLCJjcm9zc09yaWdpbiI6ZmFsc2V9'),
        signature: base64ToBuffer('MEUCIGUGL4_U2J73G9A_NQaRg1C_3AFXQr2eZtmkf-tYEnWtAiEAyInjc9ivp-jhZySFFUuzc0LKZ_43VyFzzVCSqic7M7s'),
        userHandle: base64ToBuffer('00u16budHJkxcOYz00g4')
      },
      type: 'public-key',
      getClientExtensionResults: () => ({ appid: false })
    };

    Object.defineProperty(window.navigator, 'credentials', {
      value: {},
      configurable: true,
      writable: true
    });

    Object.defineProperty(window.navigator.credentials, 'get', {
      value: () => Promise.resolve(mockCredential),
      configurable: true,
      writable: true
    });

    Object.defineProperty(window.navigator.credentials, 'create', {
      value: () => Promise.resolve(mockCredential),
      configurable: true,
      writable: true
    });

    Object.defineProperty(window, 'PublicKeyCredential', {
      value: {},
      configurable: true,
      writable: true
    });
  });

  await signInPasskeyPage.clickLaunchPasskeyButton();
  // verify we made the right call to the backend
  await t.expect(logger.contains(r => r.request.url.includes('challenge/answer/webauthn-autofillui'))).ok();
});
