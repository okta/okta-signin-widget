import { RequestMock, RequestLogger, ClientFunction } from 'testcafe';
import { checkConsoleMessages } from '../framework/shared';
import EnrollCustomPasswordPageObject from '../framework/page-objects/EnrollCustomPasswordPageObject';
import xhrAuthenticatorExpiryWarningCustomPassword from '../../../playground/mocks/data/idp/idx/authenticator-expiry-warning-custom-password';
import xhrSuccess from '../../../playground/mocks/data/idp/idx/success';

const rerenderWidget = ClientFunction((settings) => {
  // function `renderPlaygroundWidget` is defined in playground/main.js
  window.renderPlaygroundWidget(settings);
});

const logger = RequestLogger(/idp\/idx/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
  }
);

const xhrAuthenticatorExpiryWarningCustomPasswordExpireToday = JSON.parse(JSON.stringify(xhrAuthenticatorExpiryWarningCustomPassword));
xhrAuthenticatorExpiryWarningCustomPasswordExpireToday.currentAuthenticator.value.settings.daysToExpiry = 0;

const xhrAuthenticatorExpiryWarningCustomPasswordExpireSoon = JSON.parse(JSON.stringify(xhrAuthenticatorExpiryWarningCustomPassword));
delete xhrAuthenticatorExpiryWarningCustomPasswordExpireSoon.currentAuthenticator.value.settings.daysToExpiry;

const mockExpireInDays = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorExpiryWarningCustomPassword)
  .onRequestTo('http://localhost:3000/idp/idx/skip')
  .respond(xhrSuccess);

const mockExpireToday = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorExpiryWarningCustomPasswordExpireToday);

const mockExpireSoon = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorExpiryWarningCustomPasswordExpireSoon);

fixture('Custom Authenticator Password Expiry Warning');

async function setup(t) {
  const expiringCustomPasswordPage = new EnrollCustomPasswordPageObject(t);
  await expiringCustomPasswordPage.navigateToPage();
  await checkConsoleMessages({
    controller: 'custom-password-expiry-warning',
    formName: 'reenroll-custom-password-expiry-warning',
    authenticatorKey: 'okta_password',
    methodType: 'password',
  });

  return expiringCustomPasswordPage;
}

[
  [ 'Your password will expire in 4 days', mockExpireInDays],
  [ 'Your password will expire later today', mockExpireToday ],
  [ 'Your password is expiring soon', mockExpireSoon ],
].forEach(([ formTitle, mock ]) => {
  test
    .requestHooks(logger, mock)('Should have the correct labels - expire in days', async t => {
      const expiringCustomPasswordPage = await setup(t);
      await t.expect(expiringCustomPasswordPage.getFormTitle()).eql(formTitle);
      await t.expect(expiringCustomPasswordPage.getFormSubtitle()).eql('When password expires you will be locked out of your account. This password is set on another website. Click the button below to go there and set a new password.');
      await t.expect(expiringCustomPasswordPage.getRedirectButtonLabel()).eql('Go to Password reset website name');
      await t.expect(expiringCustomPasswordPage.getSkipLinkText()).eql('Remind me later');
      await t.expect(expiringCustomPasswordPage.getSignoutLinkText()).eql('Back to sign in');
    });
});

test
  .requestHooks(logger, mockExpireInDays)('should render the custom password expiring soon page and redirect to external url after clicking the button', async t => {
    const expiringCustomPasswordPage = await setup(t);

    let pageUrl = await expiringCustomPasswordPage.getPageUrl();
    await t.expect(pageUrl).eql('http://localhost:3000/');

    await expiringCustomPasswordPage.clickRedirectButton();

    pageUrl = await expiringCustomPasswordPage.getPageUrl();
    await t.expect(pageUrl).eql('http://localhost:3000/external-page.html');
  });

test
  .requestHooks(logger, mockExpireInDays)('should have a different subtitle when brandName is defined', async t => {
    const expiringCustomPasswordPage = await setup(t);
    await rerenderWidget({ brandName: 'Brand' });
    await t.expect(expiringCustomPasswordPage.getFormSubtitle()).eql('When password expires you will be locked out of your Brand account. This password is set on another website. Click the button below to go there and set a new password.');
  });