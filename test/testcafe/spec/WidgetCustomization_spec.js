import { ClientFunction, RequestMock } from 'testcafe';
import { checkA11y } from '../framework/a11y';
import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import FactorEnrollPasswordPageObject from '../framework/page-objects/FactorEnrollPasswordPageObject';
import SelectFactorPageObject from '../framework/page-objects/SelectAuthenticatorPageObject';
import xhrIdentifyWithPassword from '../../../playground/mocks/data/idp/idx/identify-with-password';
import xhrSelectAuthenticator from '../../../playground/mocks/data/idp/idx/authenticator-verification-select-authenticator';
import xhrSelectAuthenticatorEnroll from '../../../playground/mocks/data/idp/idx/authenticator-enroll-select-authenticator';
import xhrAuthenticatorResetPassword from '../../../playground/mocks/data/idp/idx/authenticator-reset-password';
import xhrAuthenticatorExpiredPassword from '../../../playground/mocks/data/idp/idx/authenticator-expired-password';
import xhrAuthenticatorExpiryWarningPassword from '../../../playground/mocks/data/idp/idx/authenticator-expiry-warning-password';

const identifyMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrIdentifyWithPassword);

const xhrSelectAuthenticatorMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrSelectAuthenticator);

const mockEnrollAuthenticator = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrSelectAuthenticatorEnroll);

const mockAuthenticatorResetPassword =  RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorResetPassword);

const mockAuthenticatorPasswordExpired =  RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorExpiredPassword);

const mockAuthenticatorPasswordExpiryWarning =  RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorExpiryWarningPassword);

const rerenderWidget = ClientFunction((settings) => {
  // function `renderPlaygroundWidget` is defined in playground/main.js
  window.renderPlaygroundWidget(settings);
});

fixture('Custom widget attributes');

async function setup(t, widgetOptions) {
  const options = widgetOptions ? { render: false } : {};
  const identityPage = new IdentityPageObject(t);
  await identityPage.navigateToPage(options);
  if (widgetOptions) {
    await rerenderWidget(widgetOptions);
  }
  await t.expect(identityPage.formExists()).ok();
  return identityPage;
}

async function setupSelectAuthenticator(t, widgetOptions) {
  const options = widgetOptions ? { render: false } : {};
  const selectAuthenticatorPageObject = new SelectFactorPageObject(t);
  await selectAuthenticatorPageObject.navigateToPage(options);
  if (widgetOptions) {
    await rerenderWidget(widgetOptions);
  }
  await t.expect(selectAuthenticatorPageObject.formExists()).ok();
  return selectAuthenticatorPageObject;
}

async function setupResetPassword(t, widgetOptions) {
  const options = widgetOptions ? { render: false } : {};
  const resetPasswordPage = new FactorEnrollPasswordPageObject(t);
  await resetPasswordPage.navigateToPage(options);
  if (widgetOptions) {
    await rerenderWidget(widgetOptions);
  }
  await t.expect(resetPasswordPage.formExists()).ok();
  return resetPasswordPage;
}

async function setupPasswordExpired(t, widgetOptions) {
  const options = widgetOptions ? { render: false } : {};
  const expiredPasswordPage = new FactorEnrollPasswordPageObject(t);
  await expiredPasswordPage.navigateToPage(options);
  if (widgetOptions) {
    await rerenderWidget(widgetOptions);
  }
  await t.expect(expiredPasswordPage.formExists()).ok();
  return expiredPasswordPage;
}


test.requestHooks(identifyMock)('should show custom footer links', async t => {
  const identityPage = await setup(t, {
    'helpLinks': {
      'help': 'https://google.com',
      'forgotPassword': 'https://okta.okta.com/signin/forgot-password',
      'custom': [
        {
          'text': 'What is Okta?',
          'href': 'https://acme.com/what-is-okta'
        },
        {
          'text': 'Acme Portal',
          'href': 'https://acme.com',
          'target': '_blank',
          'rel': 'noopener noreferrer',
        },
      ]
    },
  });
  await checkA11y(t);
  await t.expect(identityPage.getCustomForgotPasswordLinkUrl()).eql('https://okta.okta.com/signin/forgot-password');
  await t.expect(identityPage.getHelpLinkUrl()).eql('https://google.com');
  await t.expect(identityPage.getCustomHelpLinkUrl(0, 'What is Okta?')).eql('https://acme.com/what-is-okta');
  await t.expect(identityPage.getCustomHelpLinkLabel(0, 'What is Okta?')).eql('What is Okta?');
  await t.expect(identityPage.getCustomHelpLinkTarget(0, 'What is Okta?')).eql(null);
  await t.expect(identityPage.getCustomHelpLinkRel(0, 'What is Okta?')).eql(null);

  await t.expect(identityPage.getCustomHelpLinkUrl(1, 'Acme Portal')).eql('https://acme.com');
  await t.expect(identityPage.getCustomHelpLinkLabel(1, 'Acme Portal')).eql('Acme Portal');
  await t.expect(identityPage.getCustomHelpLinkTarget(1, 'Acme Portal')).eql('_blank');
  await t.expect(identityPage.getCustomHelpLinkRel(1, 'Acme Portal')).eql('noopener noreferrer');
});

test.requestHooks(xhrSelectAuthenticatorMock)('should show custom signout link', async t => {
  // setup selectAuthenticatorPageObject to see the signout link
  const selectAuthenticatorPageObject = await setupSelectAuthenticator(t, {
    'signOutLink': 'https://okta.okta.com/',
  });
  await t.expect(selectAuthenticatorPageObject.getCustomSignOutLink()).eql('https://okta.okta.com/');
  await t.expect(selectAuthenticatorPageObject.getSignoutLinkText()).eql('Back to sign in');
  await t.expect(await selectAuthenticatorPageObject.helpLinkExists()).eql(false);
});

test.requestHooks(xhrSelectAuthenticatorMock)('can customize back to signin link using `backToSignInLink`', async t => {
  // setup selectAuthenticatorPageObject to see the signout link
  const selectAuthenticatorPageObject = await setupSelectAuthenticator(t, {
    'backToSignInLink': 'https://okta.okta.com/',
  });
  await t.expect(selectAuthenticatorPageObject.getCustomSignOutLink()).eql('https://okta.okta.com/');
  await t.expect(selectAuthenticatorPageObject.getSignoutLinkText()).eql('Back to sign in');
});

test.requestHooks(identifyMock)('should show custom buttons links', async t => {
  const identityPage = await setup(t, {
    'customButtons' : [{
      'title': 'Custom Button 1',
      'className': 'btn-customAuth-1',
      'click': function() {
        window.location.href = 'https://www.example.com/';
      }
    },
    {
      'title': 'Custom Button 2',
      'className': 'btn-customAuth-1',
      'click': function() {
        window.location.href = 'https://www.example2.com/';
      }
    }]
  });
  await t.expect(identityPage.getCustomButtonText(0)).eql('Custom Button 1');
  await t.expect(identityPage.getCustomButtonText(1)).eql('Custom Button 2');

  await identityPage.clickCustomButtonLink(0);
  const pageUrl = await identityPage.getPageUrl();
  await t.expect(pageUrl)
    .eql('https://www.example.com/');
});

test.requestHooks(mockEnrollAuthenticator)('should show custom brandName title on select authenticator enroll page', async t => {
  const selectAuthenticatorPageObject = await setupSelectAuthenticator(t, {
    'brandName': 'Spaghetti Inc',
  });
  await t.expect(selectAuthenticatorPageObject.getFormSubtitle()).eql(
    'Security methods help protect your Spaghetti Inc account by ensuring only you have access.');
});

test.requestHooks(mockAuthenticatorResetPassword)('should show custom brandName title on reset password page', async t => {
  const resetPasswordPage = await setupResetPassword(t, {
    'brandName': 'Spaghetti Inc',
  });
  await t.expect(resetPasswordPage.getFormTitle()).eql('Reset your Spaghetti Inc password');
});

test.requestHooks(mockAuthenticatorPasswordExpired)('should show custom brandName title on password expired page', async t => {
  const passwordExpiredPage = await setupPasswordExpired(t, {
    'brandName': 'Spaghetti Inc',
  });
  await t.expect(passwordExpiredPage.getFormTitle()).eql(
    'Your Spaghetti Inc password has expired');
});

test.requestHooks(mockAuthenticatorPasswordExpiryWarning)('should show custom brandName title on password expiring soon page', async t => {
  const passwordExpiryWarningPage = await setupPasswordExpired(t, {
    'brandName': 'Spaghetti Inc',
  });
  await t.expect(passwordExpiryWarningPage.getFormSubtitle()).eql('When password expires you will be locked out of your Spaghetti Inc account.');
});

test.requestHooks(mockAuthenticatorPasswordExpiryWarning)('should show user\'s identifier by default if user context exists', async t => {
  const passwordExpiryWarningPage = await setupPasswordExpired(t);
  await t.expect(passwordExpiryWarningPage.getIdentifier()).eql('testUser@okta.com');
});

// TODO: OKTA-649669 - Determine whether gen 3 should support dot notation FFs. This test was originally passing in gen 3 not because the FF is
// parsed correctly but because it evaluates to undefined and hits the same logical path as 'false' in IdentifierContainer's shouldHideIdentifier()
test.meta('gen3', false).requestHooks(mockAuthenticatorPasswordExpiryWarning)('should hide user\'s identifier if feature is disabled', async t => {
  const passwordExpiryWarningPage = await setupPasswordExpired(t, {
    'features.showIdentifier': false,
  });
  await t.expect(passwordExpiryWarningPage.hasIdentifier()).eql(false);
});
