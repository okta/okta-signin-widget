import { RequestMock, RequestLogger } from 'testcafe';
import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import { checkConsoleMessages, renderWidget as rerenderWidget } from '../framework/shared';
import xhrIdentify from '../../../playground/mocks/data/idp/idx/identify';
import xhrPassword from '../../../playground/mocks/data/idp/idx/authenticator-verification-password';
import xhrErrorIdentify from '../../../playground/mocks/data/idp/idx/error-identify-access-denied';
import xhrSuccess from '../../../playground/mocks/data/idp/idx/success';

const identifyWithError = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrIdentify)
  .onRequestTo('http://localhost:3000/idp/idx/identify')
  .respond(xhrPassword)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(xhrErrorIdentify, 403);  

const identifyMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrIdentify)
  .onRequestTo('http://localhost:3000/idp/idx/identify')
  .respond(xhrPassword)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(xhrSuccess);

const identifyRequestLogger = RequestLogger(
  /idx\/identify|\/challenge/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
    logRequestHeaders: true,
  }
);

fixture('Identify With Remember Username');

async function setup(t) {
  const identityPage = new IdentityPageObject(t);
  await identityPage.navigateToPage();
  await checkConsoleMessages({
    controller: 'primary-auth',
    formName: 'identify',
  });

  return identityPage;
}

test.requestHooks(identifyRequestLogger, identifyWithError)('should NOT remember username after failed authentication', async t => {
  const identityPage = await setup(t);
  await rerenderWidget({
    features: {
      rememberMe: true,
    }
  });

  await identityPage.fillIdentifierField('test@okta.com');
  await identityPage.clickNextButton();

  await identityPage.fillPasswordField('testPassword');
  await identityPage.clickNextButton();

  await identityPage.waitForErrorBox();

  // Ensure identifier field is not pre-filled
  await identityPage.navigateToPage();
  const identifier = identityPage.getIdentifierValue();
  await t.expect(identifier).eql('');
});

test.requestHooks(identifyRequestLogger, identifyMock)('should remember username after successful authentication', async t => {
  const identityPage = await setup(t);
  await rerenderWidget({
    features: {
      rememberMe: true,
    }
  });

  await identityPage.fillIdentifierField('testUser@okta.com');
  await identityPage.clickNextButton();

  await identityPage.fillPasswordField('testPassword');
  await identityPage.clickNextButton();  

  await t.expect(identifyRequestLogger.count(() => true)).eql(2);
  const req = identifyRequestLogger.requests[0].request;
  const reqBody = JSON.parse(req.body);
  await t.expect(reqBody).eql({
    identifier: 'testUser@okta.com',
    stateHandle: 'eyJ6aXAiOiJERUYiLCJhbGlhcyI6ImVuY3J5cHRpb25rZXkiLCJ2ZXIiOiIxIiwib2lkIjoiMDBvczI0VHZiWHlqOVFLSm4wZzMiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiZGlyIn0..4z7WWUdd0LzIJLxz.GmOyeMJ5XtS7kZipFanQxaMd2rblpEeaWv8U5IfaJv5F2V1otwft4q1tVo3yqbedhBjN-nO5qk6qR-0Op34lmecwwmHeRyzYbhrFiLZaR88nhCFMblP8Bo5d3Opl5gkX02e0FQL-Osorxvml0XYbuO7GdTH5EkIv0Q7h0Dq7L__h_uFLies8AkJZWIDQh25RlqcEjToHCvVW31A_NJJ1Vf5c8GFuyb9LsJ9kUpZikpK6C72GPrU_LGrIW8VBT4l24dDEre4J8XvTNO7fdVDiq-H7BEeIjaY06q1zqlVLWwqOHoKpGNQ0NMhBIXB0ZZC57Me9pFI5GLIUwRDUIm1vw3t_mHJDVIcCJe9kmt29tTccZ8Zo0N3q5bSiwMoNHPLxZSOrbx-bf4fniorNH5ypJnke7pc2Q3DFmqfPrB7CE1REjAyCKBHYDAfVexYCkMfCl0E8oMFJinnLbynb7Bqvbp_DqL8h0pNIoXUF4KTTsuKQg8yCCqBhkajxlvh9G7L3Sf76o4B2itB7ldeqXzAE9H60yqhIKEZPNOHUgRC2SkWkWlH6NIaNWQ2Bi2CjnL9YvUuQmO-dpf08KeCgwfVmT4GBTGfTkXwy3pBitacCqEREen2j2iUH9mhi2LOOFaGLh0TXslcBgkGuht6P7gyH2JN6yFInQyIp33xQsqYg7nqOZG1LCrQSqoviTfI72-AC6b7tju8YEn1P0nXGbSzlCztSXl2pa95tr4L5pyX8fNydKYMTLeHEnmNtXlRB6wQYP1ljf4Tzgus7O0etyJs75znsXHZ42znxlEKGhTo3ucFe3CI-vsHF1FDDj2DVeWl21zVOTehTbBaemoD1ekD5F8OHS7SrK9Bw7PTa-lpyls1OxvE_Wsco4_eGbax_DoPm6DbCwj8hWzb5wLEs6TClZKoUJeV1MSVB3OgGBZ3AGzhwfeG0sGi5DnUpAeKqgP6IN8kziNRDmW3YE0qIY2mLs7nI438RTu__6bg1E6SH1QHMNucNbmoDR6VDIUmlYc0xEpygH6PBVqiPD64MnD73_D9IinVNzqW7KQzAvuFFQW_LGDfjuh1D-oTs1gi1wWDylibjxdJabveoJ10NHgeb6SaYHg.kf5iTnjNKsKqhz0iE5K_Yw',
  });

  // Ensure identifier field is pre-filled with saved username cookie
  await identityPage.navigateToPage();
  const identifier = identityPage.getIdentifierValue();
  await t.expect(identifier).eql('testUser@okta.com');
});
