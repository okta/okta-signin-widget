import { RequestMock, RequestLogger } from 'testcafe';
import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import { checkConsoleMessages, renderWidget } from '../framework/shared';
import xhrIdentifyWithPassword from '../../../playground/mocks/data/idp/idx/identify-with-password.json';
import xhrIdentifyRecover from '../../../playground/mocks/data/idp/idx/identify-recovery.json';
import xhrErrorIdentify from '../../../playground/mocks/data/idp/idx/error-identify-access-denied.json';

const identifyWithPasswordMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrIdentifyWithPassword)
  .onRequestTo('http://localhost:3000/idp/idx/identify')
  .respond(xhrErrorIdentify, 403)
  .onRequestTo('http://localhost:3000/idp/idx/recover')
  .respond(xhrIdentifyRecover);

const identifyRequestLogger = RequestLogger( /idx\/identify/, {
  logRequestBody: true,
  stringifyRequestBody: true,
});

fixture('Identify + Password');

async function setup(t) {
  const identityPage = new IdentityPageObject(t);
  await identityPage.navigateToPage();
  await checkConsoleMessages({
    controller: 'primary-auth',
    formName: 'identify',
    authenticatorKey: 'okta_password',
    methodType: 'password',
  });

  return identityPage;
}

test.requestHooks(identifyWithPasswordMock)('should show errors if required fields are empty', async t => {
  const identityPage = await setup(t);
  // await t.expect(await identityPage.hasIdentifierErrorMessage()).eql(false);

  await identityPage.clickNextButton();
  await identityPage.waitForErrorBox();

  await t.expect(await identityPage.hasIdentifierErrorMessage()).eql(true);
  await t.expect(await identityPage.getIdentifierErrorMessage()).eql('This field cannot be left blank');

  await identityPage.fillIdentifierField('Test Identifier');
  await identityPage.clickNextButton();
  await identityPage.waitForErrorBox();

  await t.expect(await identityPage.hasPasswordErrorMessage()).eql(true);
  await t.expect(await identityPage.getPasswordErrorMessage()).eql('This field cannot be left blank');
});

test.requestHooks(identifyWithPasswordMock)('should show customized error if a required field is empty', async t => {
  const identityPage = await setup(t);
  await renderWidget({
    i18n: {
      en: {
        'error.username.required': 'Username is required!', // default: 'This field cannot be left blank'
        'error.password.required': 'Password is required!', // default: 'This field cannot be left blank'
      }
    }
  });

  await identityPage.clickNextButton();
  await identityPage.waitForErrorBox();

  await t.expect(await identityPage.hasIdentifierErrorMessage()).eql(true);
  await t.expect(await identityPage.getIdentifierErrorMessage()).eql('Username is required!');

  await identityPage.fillIdentifierField('Test Identifier');
  await identityPage.clickNextButton();
  await identityPage.waitForErrorBox();

  await t.expect(await identityPage.hasPasswordErrorMessage()).eql(true);
  await t.expect(await identityPage.getPasswordErrorMessage()).eql('Password is required!');
});

test.requestHooks(identifyRequestLogger, identifyWithPasswordMock)('should have password field, password toggle, and forgot password link', async t => {
  const identityPage = await setup(t);

  await identityPage.fillIdentifierField('Test Identifier');
  await identityPage.fillPasswordField('random password 123');
  await t.expect(await identityPage.hasForgotPasswordLinkText()).ok();
  await t.expect(await identityPage.getForgotPasswordLinkText()).eql('Forgot password?');

  await t.expect(await identityPage.hasShowTogglePasswordIcon()).ok();
  await t.expect(identityPage.getSaveButtonLabel()).eql('Sign in');

  await identityPage.clickNextButton();

  await t.expect(identifyRequestLogger.count(() => true)).eql(1);
  const req = identifyRequestLogger.requests[0].request;
  const reqBody = JSON.parse(req.body);
  await t.expect(reqBody).eql({
    identifier: 'Test Identifier',
    credentials: {
      passcode: 'random password 123',
    },
    stateHandle: identifyWithPasswordMock.stateHandle,
  });
  await t.expect(req.method).eql('post');
  await t.expect(req.url).eql('http://localhost:3000/idp/idx/identify');
});

test.requestHooks(identifyRequestLogger, identifyWithPasswordMock)('should have password toggle if features.showPasswordToggleOnSignInPage is true', async t => {
  const identityPage = await setup(t);
  await renderWidget({
    features: { showPasswordToggleOnSignInPage: true },
  });
  await t.expect(await identityPage.hasShowTogglePasswordIcon()).ok();
});

test.requestHooks(identifyRequestLogger, identifyWithPasswordMock)('should not have password toggle if features.showPasswordToggleOnSignInPage is false', async t => {
  const identityPage = await setup(t);
  await renderWidget({
    features: { showPasswordToggleOnSignInPage: false },
  });
  await t.expect(await identityPage.hasShowTogglePasswordIcon()).notOk();
});

test.requestHooks(identifyRequestLogger, identifyWithPasswordMock)('should not have password toggle if "features.showPasswordToggleOnSignInPage" is false', async t => {
  const identityPage = await setup(t);
  await renderWidget({
    'features.showPasswordToggleOnSignInPage': false,
  });
  await t.expect(await identityPage.hasShowTogglePasswordIcon()).notOk();
});

test.requestHooks(identifyWithPasswordMock)('should add sub labels for Username and Password if i18n keys are defined', async t => {
  const identityPage = await setup(t);
  await renderWidget({
    i18n: {
      en: {
        'primaryauth.username.tooltip': 'Your username goes here',
        'primaryauth.password.tooltip': 'Your password goes here',
      }
    }
  });
  await t.expect(identityPage.getIdentifierSubLabelValue()).eql('Your username goes here');
  await t.expect(identityPage.getPasswordSubLabelValue()).eql('Your password goes here');
});
