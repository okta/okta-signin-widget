import { RequestMock, RequestLogger } from 'testcafe';
import { checkA11y } from '../framework/a11y';
import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import { checkConsoleMessages, renderWidget } from '../framework/shared';
import xhrIdentifyWithPassword from '../../../playground/mocks/data/idp/idx/identify-with-password';
import xhrIdentifyRecover from '../../../playground/mocks/data/idp/idx/identify-recovery';
import xhrErrorIdentify from '../../../playground/mocks/data/idp/idx/error-identify-access-denied';
import xhrErrorIdentifyAccessDeniedCustomMessage from '../../../playground/mocks/data/idp/idx/error-identify-access-denied-custom-message';
import { within } from '@testing-library/testcafe';

const identifyWithPasswordMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrIdentifyWithPassword)
  .onRequestTo('http://localhost:3000/idp/idx/identify')
  .respond(xhrErrorIdentify, 403)
  .onRequestTo('http://localhost:3000/idp/idx/recover')
  .respond(xhrIdentifyRecover);

const identifyWithPasswordErrorMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrIdentifyWithPassword)
  .onRequestTo('http://localhost:3000/idp/idx/identify')
  .respond(xhrErrorIdentifyAccessDeniedCustomMessage, 403);

const identifyRequestLogger = RequestLogger(
  /idx\/identify/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
  }
);

fixture('Identify + Password');

async function setup(t, widgetOptions) {
  const options = widgetOptions ? { render: false } : {};
  const identityPage = new IdentityPageObject(t);
  await identityPage.navigateToPage(options);
  if (widgetOptions) {
    await renderWidget(widgetOptions);
  }
  await t.expect(identityPage.formExists()).eql(true);
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
  await checkA11y(t);

  await identityPage.clickSignInButton();
  await identityPage.waitForErrorBox();

  await t.expect(identityPage.hasIdentifierErrorMessage()).eql(true);
  await t.expect(identityPage.getIdentifierErrorMessage()).match(/This field cannot be left blank/);

  await identityPage.fillIdentifierField('Test Identifier');
  await identityPage.clickSignInButton();
  await identityPage.waitForErrorBox();

  await t.expect(identityPage.hasPasswordErrorMessage()).eql(true);
  await t.expect(identityPage.getPasswordErrorMessage()).match(/This field cannot be left blank/);
});

test.requestHooks(identifyWithPasswordMock)('should show customized error if required field password is empty', async t => {
  const identityPage = await setup(t, {
    i18n: {
      en: {
        'error.username.required': 'Username is required!',
        'error.password.required': 'Password is required!',
      }
    }
  });
  await checkA11y(t);

  await identityPage.clickSignInButton();
  await identityPage.waitForErrorBox();

  await t.expect(identityPage.hasIdentifierErrorMessage()).eql(true);
  await t.expect(identityPage.getIdentifierErrorMessage()).match(/Username is required!/);


  await identityPage.fillIdentifierField('Test Identifier');
  await identityPage.clickSignInButton();
  await identityPage.waitForErrorBox();

  await t.expect(identityPage.hasPasswordErrorMessage()).eql(true);
  await t.expect(identityPage.getPasswordErrorMessage()).match(/Password is required!/);
});

test.requestHooks(identifyRequestLogger, identifyWithPasswordMock)('should have password field, password toggle, and forgot password link', async t => {
  const identityPage = await setup(t);
  await checkA11y(t);

  await identityPage.fillIdentifierField('Test Identifier');
  await identityPage.fillPasswordField('random password 123');
  await t.expect(await identityPage.hasForgotPasswordLinkText()).ok();
  await t.expect(await identityPage.helpLinkExists()).eql(true);

  await t.expect(await identityPage.hasShowTogglePasswordIcon()).ok();
  await t.expect(identityPage.getSaveButtonLabel()).eql('Sign in');

  await identityPage.clickSignInButton();

  await t.expect(identifyRequestLogger.count(() => true)).eql(1);
  const req = identifyRequestLogger.requests[0].request;
  const reqBody = JSON.parse(req.body);
  await t.expect(reqBody).eql({
    identifier: 'Test Identifier',
    credentials: {
      passcode: 'random password 123',
    },
    stateHandle: 'eyJ6aXAiOiJERUYiLCJhbGlhcyI6ImVuY3J5cHRpb25rZXkiLCJ2ZXIiOiIxIiwib2lkIjoiMDBvczI0VHZiWHlqOVFLSm4wZzMiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiZGlyIn0..4z7WWUdd0LzIJLxz.GmOyeMJ5XtS7kZipFanQxaMd2rblpEeaWv8U5IfaJv5F2V1otwft4q1tVo3yqbedhBjN-nO5qk6qR-0Op34lmecwwmHeRyzYbhrFiLZaR88nhCFMblP8Bo5d3Opl5gkX02e0FQL-Osorxvml0XYbuO7GdTH5EkIv0Q7h0Dq7L__h_uFLies8AkJZWIDQh25RlqcEjToHCvVW31A_NJJ1Vf5c8GFuyb9LsJ9kUpZikpK6C72GPrU_LGrIW8VBT4l24dDEre4J8XvTNO7fdVDiq-H7BEeIjaY06q1zqlVLWwqOHoKpGNQ0NMhBIXB0ZZC57Me9pFI5GLIUwRDUIm1vw3t_mHJDVIcCJe9kmt29tTccZ8Zo0N3q5bSiwMoNHPLxZSOrbx-bf4fniorNH5ypJnke7pc2Q3DFmqfPrB7CE1REjAyCKBHYDAfVexYCkMfCl0E8oMFJinnLbynb7Bqvbp_DqL8h0pNIoXUF4KTTsuKQg8yCCqBhkajxlvh9G7L3Sf76o4B2itB7ldeqXzAE9H60yqhIKEZPNOHUgRC2SkWkWlH6NIaNWQ2Bi2CjnL9YvUuQmO-dpf08KeCgwfVmT4GBTGfTkXwy3pBitacCqEREen2j2iUH9mhi2LOOFaGLh0TXslcBgkGuht6P7gyH2JN6yFInQyIp33xQsqYg7nqOZG1LCrQSqoviTfI72-AC6b7tju8YEn1P0nXGbSzlCztSXl2pa95tr4L5pyX8fNydKYMTLeHEnmNtXlRB6wQYP1ljf4Tzgus7O0etyJs75znsXHZ42znxlEKGhTo3ucFe3CI-vsHF1FDDj2DVeWl21zVOTehTbBaemoD1ekD5F8OHS7SrK9Bw7PTa-lpyls1OxvE_Wsco4_eGbax_DoPm6DbCwj8hWzb5wLEs6TClZKoUJeV1MSVB3OgGBZ3AGzhwfeG0sGi5DnUpAeKqgP6IN8kziNRDmW3YE0qIY2mLs7nI438RTu__6bg1E6SH1QHMNucNbmoDR6VDIUmlYc0xEpygH6PBVqiPD64MnD73_D9IinVNzqW7KQzAvuFFQW_LGDfjuh1D-oTs1gi1wWDylibjxdJabveoJ10NHgeb6SaYHg.kf5iTnjNKsKqhz0iE5K_Yw',
  });
  await t.expect(req.method).eql('post');
  await t.expect(req.url).eql('http://localhost:3000/idp/idx/identify');
});

test.requestHooks(identifyRequestLogger, identifyWithPasswordMock)('should have password toggle if features.showPasswordToggleOnSignInPage is true', async t => {
  const identityPage = await setup(t, {
    features: { showPasswordToggleOnSignInPage: true },
  });
  await checkA11y(t);
  await t.expect(await identityPage.hasShowTogglePasswordIcon()).ok();
});

test.requestHooks(identifyRequestLogger, identifyWithPasswordMock)('should not have password toggle if features.showPasswordToggleOnSignInPage is false', async t => {
  const identityPage = await setup(t, {
    features: { showPasswordToggleOnSignInPage: false },
  });
  await checkA11y(t);
  await t.expect(await identityPage.hasShowTogglePasswordIcon()).notOk();
});

// TODO: OKTA-649669 - Determine whether gen 3 should support dot notation FFs. Courage has built-in functionality for parsing this syntax of FFs
// passed to the widget config, but an investigation should be done as to whether we should support this in gen 3
test.meta('gen3', false).requestHooks(identifyRequestLogger, identifyWithPasswordMock)('should not have password toggle if "features.showPasswordToggleOnSignInPage" is false', async t => {
  const identityPage = await setup(t, {
    'features.showPasswordToggleOnSignInPage': false,
  });
  await checkA11y(t);
  await t.expect(await identityPage.hasShowTogglePasswordIcon()).notOk();
});

// Odyssey does not support callback function for auto-hiding password, but this will be deprecated in Gen3 along with showPasswordToggleOnSignInPage
test.meta('gen3', false).requestHooks(identifyRequestLogger, identifyWithPasswordMock)('should auto-hide password after 30 seconds', async t => {
  const identityPage = await setup(t, {
    features: { showPasswordToggleOnSignInPage: true },
  });
  await checkA11y(t);
  await t.expect(await identityPage.hasShowTogglePasswordIcon()).ok();
  await identityPage.fillPasswordField('password');
  await identityPage.clickShowPasswordIcon();
  const passwordField = identityPage.getTextField('Password');
  await t.expect(passwordField.getAttribute('type')).eql('text');
  // Wait 30 seconds
  await t.wait(30000);
  // Give short buffer timeout to execute assertion
  await t.expect(passwordField.getAttribute('type')).eql('password', { timeout: 500 });
});

test.requestHooks(identifyWithPasswordMock)('should add sub labels for Username and Password if i18n keys are defined', async t => {
  const identityPage = await setup(t, {
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

test.requestHooks(identifyWithPasswordMock)('should add sub labels for Username and Password if i18n keys are defined for language with lower case country code', async t => {
  const identityPage = await setup(t, {
    i18n: {
      'pt-br': {
        'primaryauth.username.tooltip': 'Your username goes here',
        'primaryauth.password.tooltip': 'Your password goes here',
      }
    },
    language: 'pt-br'
  });
  await t.expect(identityPage.getIdentifierSubLabelValue()).eql('Your username goes here');
  await t.expect(identityPage.getPasswordSubLabelValue()).eql('Your password goes here');
});

test.requestHooks(identifyWithPasswordMock)('should add sub labels for Username and Password if i18n keys are defined for language with upper case country code', async t => {
  const identityPage = await setup(t, {
    i18n: {
      'pt-BR': {
        'primaryauth.username.tooltip': 'Your username goes here',
        'primaryauth.password.tooltip': 'Your password goes here',
      }
    },
    language: 'pt-BR'
  });
  await t.expect(identityPage.getIdentifierSubLabelValue()).eql('Your username goes here');
  await t.expect(identityPage.getPasswordSubLabelValue()).eql('Your password goes here');
});

test.requestHooks(identifyWithPasswordErrorMock)('should show custom access denied error message', async t => {
  const identityPage = await setup(t);
  await checkA11y(t);

  await identityPage.fillIdentifierField('Test Identifier');
  await identityPage.fillPasswordField('adasdas');
  await identityPage.clickSignInButton();

  const errorBox = identityPage.form.getErrorBox();
  await t.expect(errorBox.innerText).contains('You do not have permission to perform the requested action.');

  const errorLink1 = within(errorBox).getByRole('link', {name: 'Help link 1'});
  const errorLink2 = within(errorBox).getByRole('link', {name: 'Help link 2'});

  await t.expect(errorLink1.exists).eql(true);
  await t.expect(errorLink1.getAttribute('href')).eql('https://www.okta.com/');

  await t.expect(errorLink2.exists).eql(true);
  await t.expect(errorLink2.getAttribute('href')).eql('https://www.okta.com/help?page=1');});

test.requestHooks(identifyRequestLogger, identifyWithPasswordMock)('should not trim whitespace characters from password when password field is in plain text view', async t => {
  const identityPage = await setup(t);
  await checkA11y(t);

  await identityPage.fillIdentifierField('Test Identifier');
  await identityPage.clickShowPasswordIcon();
  await identityPage.fillPasswordField('  password with whitespace  ');
  await identityPage.clickSignInButton();

  await t.expect(identifyRequestLogger.count(() => true)).eql(1);
  const req = identifyRequestLogger.requests[0].request;
  const reqBody = JSON.parse(req.body);
  await t.expect(reqBody).eql({
    identifier: 'Test Identifier',
    credentials: {
      passcode: '  password with whitespace  ',
    },
    stateHandle: 'eyJ6aXAiOiJERUYiLCJhbGlhcyI6ImVuY3J5cHRpb25rZXkiLCJ2ZXIiOiIxIiwib2lkIjoiMDBvczI0VHZiWHlqOVFLSm4wZzMiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiZGlyIn0..4z7WWUdd0LzIJLxz.GmOyeMJ5XtS7kZipFanQxaMd2rblpEeaWv8U5IfaJv5F2V1otwft4q1tVo3yqbedhBjN-nO5qk6qR-0Op34lmecwwmHeRyzYbhrFiLZaR88nhCFMblP8Bo5d3Opl5gkX02e0FQL-Osorxvml0XYbuO7GdTH5EkIv0Q7h0Dq7L__h_uFLies8AkJZWIDQh25RlqcEjToHCvVW31A_NJJ1Vf5c8GFuyb9LsJ9kUpZikpK6C72GPrU_LGrIW8VBT4l24dDEre4J8XvTNO7fdVDiq-H7BEeIjaY06q1zqlVLWwqOHoKpGNQ0NMhBIXB0ZZC57Me9pFI5GLIUwRDUIm1vw3t_mHJDVIcCJe9kmt29tTccZ8Zo0N3q5bSiwMoNHPLxZSOrbx-bf4fniorNH5ypJnke7pc2Q3DFmqfPrB7CE1REjAyCKBHYDAfVexYCkMfCl0E8oMFJinnLbynb7Bqvbp_DqL8h0pNIoXUF4KTTsuKQg8yCCqBhkajxlvh9G7L3Sf76o4B2itB7ldeqXzAE9H60yqhIKEZPNOHUgRC2SkWkWlH6NIaNWQ2Bi2CjnL9YvUuQmO-dpf08KeCgwfVmT4GBTGfTkXwy3pBitacCqEREen2j2iUH9mhi2LOOFaGLh0TXslcBgkGuht6P7gyH2JN6yFInQyIp33xQsqYg7nqOZG1LCrQSqoviTfI72-AC6b7tju8YEn1P0nXGbSzlCztSXl2pa95tr4L5pyX8fNydKYMTLeHEnmNtXlRB6wQYP1ljf4Tzgus7O0etyJs75znsXHZ42znxlEKGhTo3ucFe3CI-vsHF1FDDj2DVeWl21zVOTehTbBaemoD1ekD5F8OHS7SrK9Bw7PTa-lpyls1OxvE_Wsco4_eGbax_DoPm6DbCwj8hWzb5wLEs6TClZKoUJeV1MSVB3OgGBZ3AGzhwfeG0sGi5DnUpAeKqgP6IN8kziNRDmW3YE0qIY2mLs7nI438RTu__6bg1E6SH1QHMNucNbmoDR6VDIUmlYc0xEpygH6PBVqiPD64MnD73_D9IinVNzqW7KQzAvuFFQW_LGDfjuh1D-oTs1gi1wWDylibjxdJabveoJ10NHgeb6SaYHg.kf5iTnjNKsKqhz0iE5K_Yw',
  });
  await t.expect(req.method).eql('post');
  await t.expect(req.url).eql('http://localhost:3000/idp/idx/identify');
});

test.requestHooks(identifyRequestLogger, identifyWithPasswordMock)('should set autocomplete to off on username and password fields when features.disableAutocomplete is true', async t => {
  const identityPage = await setup(t, {
    features: {
      disableAutocomplete: true,
    },
  });
  await checkA11y(t);

  await t.expect(identityPage.getFormTitle()).eql('Sign In');
  const userNameField = identityPage.getTextField('Username');
  await t.expect(userNameField.getAttribute('autocomplete')).eql('off');
  const passwordField = identityPage.getTextField('Password');
  await t.expect(passwordField.getAttribute('autocomplete')).eql('off');
});
