import { RequestMock, RequestLogger } from 'testcafe';
import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import IdentityRecoverPageObject from '../framework/page-objects/IdentifyRecoverPageObject';
import { checkConsoleMessages, renderWidget } from '../framework/shared';
import xhrIdentify from '../../../playground/mocks/data/idp/idx/identify';
import xhrIdentifyWithPassword from '../../../playground/mocks/data/idp/idx/identify-with-password';
import xhrIdentifyRecover from '../../../playground/mocks/data/idp/idx/identify-recovery';
import xhrErrorIdentify from '../../../playground/mocks/data/idp/idx/error-identify-access-denied';

const identifyWithPasswordMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrIdentifyWithPassword)
  .onRequestTo('http://localhost:3000/idp/idx/identify')
  .respond(xhrErrorIdentify, 403)
  .onRequestTo('http://localhost:3000/idp/idx/recover')
  .respond(xhrIdentifyRecover);

const identifyMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrIdentify);

const identifyRequestLogger = RequestLogger(
  /idx\/identify/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
  }
);

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
    stateHandle: 'eyJ6aXAiOiJERUYiLCJhbGlhcyI6ImVuY3J5cHRpb25rZXkiLCJ2ZXIiOiIxIiwib2lkIjoiMDBvczI0VHZiWHlqOVFLSm4wZzMiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiZGlyIn0..4z7WWUdd0LzIJLxz.GmOyeMJ5XtS7kZipFanQxaMd2rblpEeaWv8U5IfaJv5F2V1otwft4q1tVo3yqbedhBjN-nO5qk6qR-0Op34lmecwwmHeRyzYbhrFiLZaR88nhCFMblP8Bo5d3Opl5gkX02e0FQL-Osorxvml0XYbuO7GdTH5EkIv0Q7h0Dq7L__h_uFLies8AkJZWIDQh25RlqcEjToHCvVW31A_NJJ1Vf5c8GFuyb9LsJ9kUpZikpK6C72GPrU_LGrIW8VBT4l24dDEre4J8XvTNO7fdVDiq-H7BEeIjaY06q1zqlVLWwqOHoKpGNQ0NMhBIXB0ZZC57Me9pFI5GLIUwRDUIm1vw3t_mHJDVIcCJe9kmt29tTccZ8Zo0N3q5bSiwMoNHPLxZSOrbx-bf4fniorNH5ypJnke7pc2Q3DFmqfPrB7CE1REjAyCKBHYDAfVexYCkMfCl0E8oMFJinnLbynb7Bqvbp_DqL8h0pNIoXUF4KTTsuKQg8yCCqBhkajxlvh9G7L3Sf76o4B2itB7ldeqXzAE9H60yqhIKEZPNOHUgRC2SkWkWlH6NIaNWQ2Bi2CjnL9YvUuQmO-dpf08KeCgwfVmT4GBTGfTkXwy3pBitacCqEREen2j2iUH9mhi2LOOFaGLh0TXslcBgkGuht6P7gyH2JN6yFInQyIp33xQsqYg7nqOZG1LCrQSqoviTfI72-AC6b7tju8YEn1P0nXGbSzlCztSXl2pa95tr4L5pyX8fNydKYMTLeHEnmNtXlRB6wQYP1ljf4Tzgus7O0etyJs75znsXHZ42znxlEKGhTo3ucFe3CI-vsHF1FDDj2DVeWl21zVOTehTbBaemoD1ekD5F8OHS7SrK9Bw7PTa-lpyls1OxvE_Wsco4_eGbax_DoPm6DbCwj8hWzb5wLEs6TClZKoUJeV1MSVB3OgGBZ3AGzhwfeG0sGi5DnUpAeKqgP6IN8kziNRDmW3YE0qIY2mLs7nI438RTu__6bg1E6SH1QHMNucNbmoDR6VDIUmlYc0xEpygH6PBVqiPD64MnD73_D9IinVNzqW7KQzAvuFFQW_LGDfjuh1D-oTs1gi1wWDylibjxdJabveoJ10NHgeb6SaYHg.kf5iTnjNKsKqhz0iE5K_Yw',
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

test.requestHooks(identifyWithPasswordMock)('should show forgot password page when navigates to /signin/forgot-password', async t => {
  const page = new IdentityRecoverPageObject(t);
  await page.navigateToPage();
  await t.expect(page.form.getTitle()).eql('Reset your password');
  await t.expect(await page.getIdentifyFieldLabel()).eql('Email or Username');
});
test.requestHooks(identifyMock)('should show errors when forgot password is not supported', async t => {
  const page = new IdentityRecoverPageObject(t);
  await page.navigateToPage();
  await t.expect(page.form.getTitle()).eql('Reset your password');
  await t.expect(page.form.getErrorBoxText()).eql('Forgot password is not enabled for this organization.');
});
