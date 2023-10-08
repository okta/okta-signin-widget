import { RequestMock, RequestLogger } from 'testcafe';
import { checkA11y } from '../framework/a11y';
import { checkConsoleMessages } from '../framework/shared';
import EnrollCustomPasswordPageObject from '../framework/page-objects/EnrollCustomPasswordPageObject';
import xhrAuthenticatorExpiredCustomPassword from '../../../playground/mocks/data/idp/idx/authenticator-expired-custom-password';

const logger = RequestLogger(/idp\/idx/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
  }
);

const mock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorExpiredCustomPassword);

fixture('Custom Authenticator Expired Password');

async function setup(t) {
  const expiredCustomPasswordPage = new EnrollCustomPasswordPageObject(t);
  await expiredCustomPasswordPage.navigateToPage();
  await expiredCustomPasswordPage.formExists();
  await checkConsoleMessages({
    controller: 'custom-password-expired',
    formName: 'reenroll-custom-password-expiry',
    authenticatorKey: 'okta_password',
    methodType: 'password',
  });

  return expiredCustomPasswordPage;
}

test
  .requestHooks(logger, mock)('should render the expired custom password page and redirect to external url after clicking the button', async t => {
    const expiredCustomPasswordPage = await setup(t);
    await checkA11y(t);
    
    await t.expect(expiredCustomPasswordPage.getFormTitle()).eql('Your password has expired');
    await t.expect(expiredCustomPasswordPage.getFormSubtitle()).eql('This password is set on another website. Click the button below to go there and set a new password.');
    await t.expect(expiredCustomPasswordPage.getRedirectButton().exists).eql(true);

    let pageUrl = await expiredCustomPasswordPage.getPageUrl();
    await t.expect(pageUrl).eql('http://localhost:3000/');

    await expiredCustomPasswordPage.clickRedirectButton();

    pageUrl = await expiredCustomPasswordPage.getPageUrl();
    await t.expect(pageUrl).eql('http://localhost:3000/external-page.html');
  });
