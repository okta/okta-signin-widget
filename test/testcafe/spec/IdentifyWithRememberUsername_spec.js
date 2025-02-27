import { RequestMock, RequestLogger } from 'testcafe';
import { checkA11y } from '../framework/a11y';
import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import ChallengeEmailPageObject from '../framework/page-objects/ChallengeEmailPageObject';
import { renderWidget as rerenderWidget } from '../framework/shared';
import xhrIdentify from '../../../playground/mocks/data/idp/idx/identify';
import xhrIdentifyWithUsername from '../../../playground/mocks/data/idp/idx/identify-with-username';
import xhrPassword from '../../../playground/mocks/data/idp/idx/authenticator-verification-password';
import xhrSuccess from '../../../playground/mocks/data/idp/idx/success';
import xhrIdentifyWithPassword from '../../../playground/mocks/data/idp/idx/identify-with-password';
import emailVerification from '../../../playground/mocks/data/idp/idx/authenticator-verification-email';


const identifyMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrIdentify)
  .onRequestTo('http://localhost:3000/idp/idx/identify')
  .respond(xhrPassword)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(xhrSuccess);

const identifyWithUsernameMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrIdentifyWithUsername);

const identifyWithPasswordMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrIdentifyWithPassword)
  .onRequestTo('http://localhost:3000/idp/idx/identify')
  .respond(xhrSuccess);

const identifyWithEmailAuthenticator = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrIdentify)
  .onRequestTo('http://localhost:3000/idp/idx/identify')
  .respond(emailVerification)
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

const baseConfig = {
  features: {
    rememberMe: true
  }
};

fixture('Identify With Remember Username');

async function setup(t, options) {
  const identityPage = new IdentityPageObject(t);
  await identityPage.navigateToPage(options || {});
  return identityPage;
}

test.requestHooks(identifyRequestLogger, identifyMock)('identifer first flow - should remember username after successful authentication', async t => {
  const identityPage = await setup(t, { render: false });
  await rerenderWidget(baseConfig);
  await t.expect(identityPage.formExists()).ok();
  await checkA11y(t);

  await identityPage.fillIdentifierField('testUser@okta.com');
  await identityPage.clickNextButton();

  await identityPage.fillPasswordField('testPassword');
  await identityPage.clickVerifyButton();

  await t.expect(identifyRequestLogger.count(() => true)).eql(2);
  const req = identifyRequestLogger.requests[0].request;
  const reqBody = JSON.parse(req.body);
  await t.expect(reqBody).contains({
    identifier: 'testUser@okta.com',
  });

  // Ensure identifier field is pre-filled with saved username cookie
  await identityPage.navigateToPage({ render: false });
  await rerenderWidget(baseConfig);
  await t.expect(identityPage.formExists()).ok();
  const identifier = identityPage.getIdentifierValue();
  await t.expect(identifier).eql('testUser@okta.com');
});

test.requestHooks(identifyRequestLogger, identifyWithPasswordMock)('identifer with password - should remember username after successful authentication', async t => {
  const identityPage = await setup(t, { render: false });
  await rerenderWidget(baseConfig);
  await t.expect(identityPage.formExists()).ok();
  await checkA11y(t);

  await identityPage.fillIdentifierField('testUser@okta.com');
  await identityPage.fillPasswordField('testPassword');
  await identityPage.clickSignInButton();

  await t.expect(identifyRequestLogger.count(() => true)).eql(1);
  const req = identifyRequestLogger.requests[0].request;
  const reqBody = JSON.parse(req.body);

  await t.expect(reqBody).contains({
    identifier: 'testUser@okta.com',
  });
  await t.expect(reqBody.credentials).contains({
    passcode: 'testPassword'
  });

  // Ensure identifier field is pre-filled with saved username cookie
  await identityPage.navigateToPage({ render: false });
  await rerenderWidget(baseConfig);
  await t.expect(identityPage.formExists()).ok();
  const identifier = identityPage.getIdentifierValue();
  await t.expect(identifier).eql('testUser@okta.com');
});

test.requestHooks(identifyRequestLogger, identifyWithEmailAuthenticator)('identifer with email challenge - should remember username after successful authentication', async t => {
  const options = {
    features: {
      rememberMe: true
    },
  };

  const identityPage = await setup(t, { render: false });
  await identityPage.mockCrypto();
  await t.setNativeDialogHandler(() => true);
  await rerenderWidget(options);
  await t.expect(identityPage.formExists()).ok();
  await checkA11y(t);

  await identityPage.fillIdentifierField('testUser@okta.com');
  await identityPage.clickNextButton();

  const challengeEmailPageObject = new ChallengeEmailPageObject(t);
  await challengeEmailPageObject.clickEnterCodeLink();

  await challengeEmailPageObject.verifyFactor('credentials.passcode', '1234');
  await challengeEmailPageObject.clickVerifyButton();

  const req = identifyRequestLogger.requests[0].request;
  const reqBody = JSON.parse(req.body);
  await t.expect(reqBody).contains({
    identifier: 'testUser@okta.com',
  });

  // Ensure identifier field is pre-filled with saved username cookie
  await identityPage.navigateToPage({ render: false });
  await rerenderWidget(baseConfig);
  await t.expect(identityPage.formExists()).ok();
  const identifier = identityPage.getIdentifierValue();
  await t.expect(identifier).eql('testUser@okta.com');
});

test
  .requestHooks(identifyRequestLogger, identifyMock)('should pre-fill identifier field with config.username passed in and feature.rememberMe enabled', async t => {
    const identityPage = await setup(t, { render: false });
    await rerenderWidget(baseConfig);
    await t.expect(identityPage.formExists()).ok();
    await checkA11y(t);

    // Go through authentication process to save cookie
    await identityPage.fillIdentifierField('testUser@okta.com');
    await identityPage.clickNextButton();

    await identityPage.fillPasswordField('testPassword');
    await identityPage.clickVerifyButton();

    await t.expect(identifyRequestLogger.count(() => true)).eql(2);
    const req = identifyRequestLogger.requests[0].request;
    const reqBody = JSON.parse(req.body);
    await t.expect(reqBody).contains({
      identifier: 'testUser@okta.com',
    });

    // Ensure identifier field is pre-filled with config.username passed in
    await identityPage.navigateToPage({ render: false });
    await rerenderWidget({
      username: 'configUsername@okta.com',
      features: {
        rememberMe: true
      }
    });
    await t.expect(identityPage.formExists()).ok();

    const identifier = identityPage.getIdentifierValue();
    await t.expect(identifier).eql('configUsername@okta.com');
  });

test.requestHooks(identifyRequestLogger, identifyMock)('should pre-fill identifier field with remediation identifier value over saved cookie', async t => {
  const identityPage = await setup(t, { render: false });
  await rerenderWidget(baseConfig);
  await t.expect(identityPage.formExists()).ok();
  await checkA11y(t);

  // Go through authentication process to save cookie
  await identityPage.fillIdentifierField('cookieUser@okta.com');
  await identityPage.clickNextButton();

  await identityPage.fillPasswordField('testPassword');
  await identityPage.clickVerifyButton();

  await t.expect(identifyRequestLogger.count(() => true)).eql(2);
  const req = identifyRequestLogger.requests[0].request;
  const reqBody = JSON.parse(req.body);
  await t.expect(reqBody).contains({
    identifier: 'cookieUser@okta.com',
  });

  // Mock the server response to include identifier value
  await t.removeRequestHooks(identifyMock);
  await t.addRequestHooks(identifyWithUsernameMock);

  await identityPage.navigateToPage({ 'login_hint': 'testUsername@okta.com', render: false });
  await rerenderWidget({
    features: {
      rememberMe: true
    }
  });
  await t.expect(identityPage.formExists()).ok();

  // Ensure identifier field is pre-filled with identifier returned in remediation
  const identifier = identityPage.getIdentifierValue();
  await t.expect(identifier).eql('testUsername@okta.com');
});

test.requestHooks(identifyRequestLogger, identifyMock)('should store identifier in ln cookie when updated', async t => {
  const identityPage = await setup(t, { render: false });

  await t.setCookies({name: 'ln', value: 'PREFILL VALUE', httpOnly: false});

  await rerenderWidget({
    features: {
      rememberMe: true
    }
  });
  await t.expect(identityPage.formExists()).ok();

  await t.expect(identityPage.getIdentifierValue()).eql('PREFILL VALUE');

  await identityPage.fillIdentifierField('TestIdentifier');
  await identityPage.clickNextButton();

  const cookie = await t.getCookies('ln');

  await t
    .expect(cookie[0].name).eql('ln')
    .expect(cookie[0].value).eql('TestIdentifier');
});

test.requestHooks(identifyRequestLogger, identifyMock)('should store transformed identifier in ln cookie when updated and transformUsername is defined', async t => {
  const identityPage = await setup(t, { render: false });

  await t.setCookies({name: 'ln', value: 'PREFILL VALUE', httpOnly: false});

  await rerenderWidget({
    features: {
      rememberMe: true
    },
    transformUsername: (username) => {
      // This example will append the '@acme.com' domain if the user has
      // not entered it
      return username.includes('@acme.com')
        ? username
        : username + '@acme.com';
    }
  });
  await t.expect(identityPage.formExists()).ok();

  await t.expect(identityPage.getIdentifierValue()).eql('PREFILL VALUE');

  await identityPage.fillIdentifierField('TestIdentifier');
  await identityPage.clickNextButton();

  const cookie = await t.getCookies('ln');

  await t
    .expect(cookie[0].name).eql('ln')
    .expect(cookie[0].value).eql('TestIdentifier');
});

test.requestHooks(identifyRequestLogger, identifyWithPasswordMock)('transformUsername should map identifier in request, but only display user typed identifier in form', async t => {
  const identityPage = await setup(t, { render: false });

  await t.setCookies({name: 'ln', value: 'PREFILL VALUE', httpOnly: false});

  await rerenderWidget({
    features: {
      rememberMe: true
    },
    transformUsername: (username) => {
      // This example will append the '@acme.com' domain if the user has
      // not entered it
      return username.includes('@acme.com')
        ? username
        : username + '@acme.com';
    }
  });
  await t.expect(identityPage.formExists()).ok();

  await t.expect(identityPage.getIdentifierValue()).eql('PREFILL VALUE');

  await identityPage.fillIdentifierField('test.identifier');
  await identityPage.fillPasswordField('password');
  await identityPage.clickSignInButton();

  await t.expect(identifyRequestLogger.count(() => true)).eql(1);
  const req = identifyRequestLogger.requests[0].request;
  const reqBody = JSON.parse(req.body);
  await t.expect(reqBody).eql({
    identifier: 'test.identifier@acme.com',
    credentials: {
      passcode: 'password',
    },
    stateHandle: 'eyJ6aXAiOiJERUYiLCJhbGlhcyI6ImVuY3J5cHRpb25rZXkiLCJ2ZXIiOiIxIiwib2lkIjoiMDBvczI0VHZiWHlqOVFLSm4wZzMiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiZGlyIn0..4z7WWUdd0LzIJLxz.GmOyeMJ5XtS7kZipFanQxaMd2rblpEeaWv8U5IfaJv5F2V1otwft4q1tVo3yqbedhBjN-nO5qk6qR-0Op34lmecwwmHeRyzYbhrFiLZaR88nhCFMblP8Bo5d3Opl5gkX02e0FQL-Osorxvml0XYbuO7GdTH5EkIv0Q7h0Dq7L__h_uFLies8AkJZWIDQh25RlqcEjToHCvVW31A_NJJ1Vf5c8GFuyb9LsJ9kUpZikpK6C72GPrU_LGrIW8VBT4l24dDEre4J8XvTNO7fdVDiq-H7BEeIjaY06q1zqlVLWwqOHoKpGNQ0NMhBIXB0ZZC57Me9pFI5GLIUwRDUIm1vw3t_mHJDVIcCJe9kmt29tTccZ8Zo0N3q5bSiwMoNHPLxZSOrbx-bf4fniorNH5ypJnke7pc2Q3DFmqfPrB7CE1REjAyCKBHYDAfVexYCkMfCl0E8oMFJinnLbynb7Bqvbp_DqL8h0pNIoXUF4KTTsuKQg8yCCqBhkajxlvh9G7L3Sf76o4B2itB7ldeqXzAE9H60yqhIKEZPNOHUgRC2SkWkWlH6NIaNWQ2Bi2CjnL9YvUuQmO-dpf08KeCgwfVmT4GBTGfTkXwy3pBitacCqEREen2j2iUH9mhi2LOOFaGLh0TXslcBgkGuht6P7gyH2JN6yFInQyIp33xQsqYg7nqOZG1LCrQSqoviTfI72-AC6b7tju8YEn1P0nXGbSzlCztSXl2pa95tr4L5pyX8fNydKYMTLeHEnmNtXlRB6wQYP1ljf4Tzgus7O0etyJs75znsXHZ42znxlEKGhTo3ucFe3CI-vsHF1FDDj2DVeWl21zVOTehTbBaemoD1ekD5F8OHS7SrK9Bw7PTa-lpyls1OxvE_Wsco4_eGbax_DoPm6DbCwj8hWzb5wLEs6TClZKoUJeV1MSVB3OgGBZ3AGzhwfeG0sGi5DnUpAeKqgP6IN8kziNRDmW3YE0qIY2mLs7nI438RTu__6bg1E6SH1QHMNucNbmoDR6VDIUmlYc0xEpygH6PBVqiPD64MnD73_D9IinVNzqW7KQzAvuFFQW_LGDfjuh1D-oTs1gi1wWDylibjxdJabveoJ10NHgeb6SaYHg.kf5iTnjNKsKqhz0iE5K_Yw',
  });
  await t.expect(req.method).eql('post');
  await t.expect(req.url).eql('http://localhost:3000/idp/idx/identify');

  // Ensure identifier field is pre-filled with saved username cookie
  await identityPage.navigateToPage({ render: false });
  await rerenderWidget(baseConfig);
  await t.expect(identityPage.formExists()).ok();
  const identifier = identityPage.getIdentifierValue();
  await t.expect(identifier).eql('test.identifier');
});
