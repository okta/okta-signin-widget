import { RequestLogger, RequestMock, Selector, ClientFunction } from 'testcafe';
import { checkA11y } from '../framework/a11y';
import SignInDevicePageObject from '../framework/page-objects/SignInDevicePageObject';
import smartProbingRequired from '../../../playground/mocks/data/idp/idx/smart-probing-required';
import launchAuthenticatorOption from '../../../playground/mocks/data/idp/idx/identify-with-device-launch-authenticator';

const logger = RequestLogger(/introspect/);

const mock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(smartProbingRequired)
  .onRequestTo('http://localhost:3000/idp/idx/authenticators/okta-verify/launch')
  .respond(launchAuthenticatorOption);

fixture('Sign in with Okta Verify is required')
  .requestHooks(logger, mock);

const baseConfig = {
  features: {
    rememberMe: true
  }
};

const rerenderWidget = ClientFunction((settings) => {
  window.renderPlaygroundWidget(settings);
});

async function setup(t) {
  const signInDevicePageObject = new SignInDevicePageObject(t);
  await signInDevicePageObject.navigateToPage();
  await t.expect(signInDevicePageObject.formExists()).ok();
  await checkA11y(t);
  return signInDevicePageObject;
}

async function setupWithSession(t, authenticated) {
  const signInDevicePage = new SignInDevicePageObject(t);
  await signInDevicePage.navigateToPage({ render: false });
  if (authenticated) {
    await t.setCookies({name: 'isuauth', value: '1', httpOnly: false, path: '/'});
  }

  await rerenderWidget(baseConfig);
  await checkA11y(t);
  return signInDevicePage;
}

test.requestHooks(mock)('does show the back button when session is not set', async t => {
  const signInDevicePage = await setupWithSession(t, false);

  await t.expect(signInDevicePage.formExists()).ok();
  await t.expect(signInDevicePage.form.getTitle()).eql('Sign In');
  await t.expect(signInDevicePage.getOVButtonIcon().exists).eql(true);
  await t.expect(signInDevicePage.getOVButtonLabel()).eql('Sign in with Okta FastPass');
  await t.expect(signInDevicePage.getContentText().exists).eql(true);
  await t.expect(signInDevicePage.getSignoutLinkText()).eql('Back to sign in');
});

test.requestHooks(mock)('does not show the back button session is set', async t => {
  const signInDevicePage = await setupWithSession(t, true);

  await t.expect(signInDevicePage.formExists()).ok();
  await t.expect(signInDevicePage.form.getTitle()).eql('Sign In');
  await t.expect(signInDevicePage.getOVButtonIcon().exists).eql(true);
  await t.expect(signInDevicePage.getOVButtonLabel()).eql('Sign in with Okta FastPass');
  await t.expect(signInDevicePage.getContentText().exists).eql(true);
  const signoutLinkExists = await signInDevicePage.signoutLinkExists();
  await t.expect(signoutLinkExists).eql(false);
});

test.requestHooks(mock)('shows the correct content', async t => {
  const signInDevicePage = await setup(t);

  await t.expect(signInDevicePage.form.getTitle()).eql('Sign In');
  await t.expect(signInDevicePage.getOVButtonIcon().exists).eql(true);
  await t.expect(signInDevicePage.getContentText().exists).eql(true);
  await t.expect(signInDevicePage.getOVButtonLabel()).eql('Sign in with Okta FastPass');
});

test.requestHooks(mock)('clicking the launch Okta Verify button takes user to the right UI', async t => {
  const signInDevicePage = await setup(t);

  await signInDevicePage.clickLaunchOktaVerifyButton();
  const header = new Selector('h2[data-se="o-form-head"]');
  await t.expect(header.textContent).eql('Click "Open Okta Verify" on the browser prompt');
});

test('shows the correct footer links', async t => {
  const signInDevicePage = await setupWithSession(t, true);

  await t.expect(signInDevicePage.getEnrollFooterLink().exists).eql(true);
  await t.expect(signInDevicePage.getHelpLink().exists).eql(true);
  const signoutLinkExists = await signInDevicePage.signoutLinkExists();
  await t.expect(signoutLinkExists).eql(false);
});