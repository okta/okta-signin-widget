import { RequestLogger, RequestMock, Selector, userVariables } from 'testcafe';
import SignInDevicePageObject from '../framework/page-objects/SignInDevicePageObject';
import smartProbingRequired from '../../../playground/mocks/data/idp/idx/smart-probing-required';
import launchAuthenticatorOption from '../../../playground/mocks/data/idp/idx/identify-with-device-launch-authenticator';

const logger = RequestLogger(/introspect/);

const mock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(smartProbingRequired)
  .onRequestTo('http://localhost:3000/idp/idx/authenticators/okta-verify/launch')
  .respond(launchAuthenticatorOption);

fixture('Sign in with Okta Verify is required').meta('v3', true)
  .requestHooks(logger, mock);

async function setup(t) {
  const signInDevicePageObject = new SignInDevicePageObject(t);
  await signInDevicePageObject.navigateToPage();
  return signInDevicePageObject;
}

test('shows the correct content', async t => {
  const signInDevicePage = await setup(t);
  await t.expect(signInDevicePage.getHeader()).eql('Sign In');
  if(userVariables.v3) {
    await t.expect(signInDevicePage.getOVButtonIcon()).eql('Okta Verify');
  } else {
    await t.expect(signInDevicePage.getOVButtonIcon()).eql('icon okta-verify-authenticator');
  }
  await t.expect(signInDevicePage.getContentText().exists).eql(true);
  await t.expect(signInDevicePage.getOVButtonLabel()).eql('Sign in with Okta FastPass');
});

test('clicking the launch Okta Verify button takes user to the right UI', async t => {
  const signInDevicePage = await setup(t);
  await signInDevicePage.clickLaunchOktaVerifyButton();
  const header = new Selector('h2[data-se="o-form-head"]');
  await t.expect(header.textContent).eql('Click "Open Okta Verify" on the browser prompt');
});

test('shows the correct footer links', async t => {
  const signInDevicePage = await setup(t);
  await t.expect(signInDevicePage.getEnrollFooterLink().exists).eql(true);
  if(!userVariables.v3) {
    await t.expect(signInDevicePage.getHelpFooterLink().innerText).eql('Help');
  }
  await t.expect(signInDevicePage.getSignOutFooterLink().exists).eql(false);
});
