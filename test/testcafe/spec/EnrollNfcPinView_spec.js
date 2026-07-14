import { RequestMock } from 'testcafe';
import { checkA11y } from '../framework/a11y';
import ChallengeNfcPinPageObject from '../framework/page-objects/ChallengeNfcPinPageObject';
import xhrNfcPinEnrollDeviceChallenge from '../../../playground/mocks/data/idp/idx/authenticator-enroll-nfc-pin-device-challenge';
import xhrNfcPinEnrollPinCreation from '../../../playground/mocks/data/idp/idx/authenticator-enroll-nfc-pin-pin-creation';
import xhrNfcPinEnrollSuccess from '../../../playground/mocks/data/idp/idx/authenticator-enroll-nfc-pin-success';

// Mock that stays on device challenge (keeps polling)
const mockNfcPinEnrollDeviceChallengeStays = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrNfcPinEnrollDeviceChallenge)
  .onRequestTo('http://localhost:3000/idp/idx/authenticators/poll')
  .respond(xhrNfcPinEnrollDeviceChallenge);

// Mock that transitions from device challenge to PIN creation on first poll
const mockNfcPinEnrollDeviceChallengeFlow = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrNfcPinEnrollDeviceChallenge)
  .onRequestTo('http://localhost:3000/idp/idx/authenticators/poll')
  .respond(xhrNfcPinEnrollPinCreation)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(xhrNfcPinEnrollSuccess);

// Mock that starts directly at PIN creation
const mockNfcPinEnrollPinCreation = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrNfcPinEnrollPinCreation)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(xhrNfcPinEnrollSuccess);

fixture('Enroll NFC PIN Authenticator');

async function setup(t) {
  const page = new ChallengeNfcPinPageObject(t);
  await page.navigateToPage();
  await t.expect(page.formExists()).eql(true);
  return page;
}

test
  .requestHooks(mockNfcPinEnrollDeviceChallengeStays)('shows NFC enrollment intermediate screen', async t => {
    const page = await setup(t);
    await checkA11y(t);

    const pageTitle = page.getFormTitle();
    await t.expect(pageTitle).contains('Set up NFC');
    await t.expect(await page.openOktaVerifyButtonExists()).ok();
  });

test
  .requestHooks(mockNfcPinEnrollDeviceChallengeFlow)('transitions from device challenge to PIN creation after polling', async t => {
    const page = await setup(t);

    // Wait for polling to transition to PIN creation
    const pageTitle = page.getFormTitle();
    await t.expect(pageTitle).contains('Choose a PIN', { timeout: 15000 });
  });

test
  .requestHooks(mockNfcPinEnrollPinCreation)('shows PIN creation screen with correct title', async t => {
    const page = await setup(t);
    await checkA11y(t);

    const pageTitle = page.getFormTitle();
    await t.expect(pageTitle).contains('Choose a PIN');
  });

test
  .requestHooks(mockNfcPinEnrollPinCreation)('shows PIN requirements section', async t => {
    const page = await setup(t);

    await t.expect(await page.requirementsExist()).ok();
  });

test
  .requestHooks(mockNfcPinEnrollPinCreation)('shows Back to sign in link', async t => {
    const page = await setup(t);

    await t.expect(await page.signoutLinkExists()).ok();
    await t.expect(page.getSignoutLinkText()).eql('Back to sign in');
  });

test
  .requestHooks(mockNfcPinEnrollPinCreation)('shows error when PIN field is blank on submit', async t => {
    const page = await setup(t);

    await page.clickNextButton();
    await t.expect(page.form.getErrorBoxCount()).eql(1);
  });

test
  .requestHooks(mockNfcPinEnrollPinCreation)('shows error when PINs do not match', async t => {
    const page = await setup(t);

    await page.fillPin('1234');
    await page.fillConfirmPin('5678');
    await page.clickNextButton();

    const confirmError = await page.getConfirmPinError();
    await t.expect(confirmError).contains('PINs must match');
  });
