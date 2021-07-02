import { RequestMock, RequestLogger } from 'testcafe';
import PIVPageObject from '../framework/page-objects/PIVPageObject';
import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import xhrIdentifyWithThirdPartyIdps from '../../../playground/mocks/data/idp/idx/identify-with-third-party-idps';
import xhrVerifyWithPIVOnly from '../../../playground/mocks/data/idp/idx/identify-with-piv-only.json';
import xhrVerifyPIVError from '../../../playground/mocks/data/idp/idx/error-identify-with-piv.json';
import { checkConsoleMessages } from '../framework/shared';

const logger = RequestLogger(/introspect/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
  }
);


const verifyWithSelectPIVIdpMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrIdentifyWithThirdPartyIdps)
  .onRequestTo('https://okta.mtls.okta.com/sso/idps/mtlsidp?stateToken=eyJ6aXAiOiJERUYiLCJhbGlhcyI6ImVuY3J5cHRpb25')
  .respond('<html><h1>MTLS Url for PIV auth</h1></html>');

const verifyWithOnlyPIVIdPMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrVerifyWithPIVOnly)
  .onRequestTo('https://okta.mtls.okta.com/sso/idps/mtlsidp?stateToken=eyJ6aXAiOiJERUYiLCJhbGlhcyI6ImVuY3J5cHRpb25')
  .respond('<html><h1>MTLS Url for PIV auth</h1></html>');

const verifyErrorMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrVerifyPIVError);

async function setup(t) {
  const identityPage = new IdentityPageObject(t);
  await identityPage.navigateToPage();
  await checkConsoleMessages({
    controller: 'primary-auth',
    formName: 'identify'
  });
  return identityPage;
}

fixture('Verify PIV IdP');
test
  .requestHooks(logger, verifyWithSelectPIVIdpMock)('verify with PIV IdP from identify form', async t => {
    const identityPage = await setup(t);
    
    await t.expect(identityPage.identifierFieldExists('.o-form-input .input-fix input')).eql(true);
    await t.expect(identityPage.getIdpButton('.piv-button').textContent).eql('Sign in with PIV / CAC card');
    await identityPage.clickIdpButton('.piv-button');

    const pageUrl = await identityPage.getPageUrl();
    await t.expect(pageUrl)
      .eql('https://okta.mtls.okta.com/sso/idps/mtlsidp?stateToken=eyJ6aXAiOiJERUYiLCJhbGlhcyI6ImVuY3J5cHRpb25');
  });

test
  .requestHooks(logger, verifyWithOnlyPIVIdPMock)('verify with only PIV IdP remediation form', async t => {
    const pivPageObject = new PIVPageObject(t);
    await pivPageObject.navigateToPage();
    // wait for save to be triggered automatically
    await t.wait(2000);
    // automatically prompts for cert when piv is the only remediation
    const pageUrl = await pivPageObject.getPageUrl();
    await t.expect(pageUrl)
      .eql('https://okta.mtls.okta.com/sso/idps/mtlsidp?stateToken=eyJ6aXAiOiJERUYiLCJhbGlhcyI6ImVuY3J5cHRpb25');
  });

test
  .requestHooks(logger, verifyErrorMock)('verify with PIV IdP surfaces error messages', async t => {
    const pivPageObject = new PIVPageObject(t);
    await pivPageObject.navigateToPage();

    await t.expect(pivPageObject.getPageTitle()).eql('PIV / CAC card');
    const subtitle = await pivPageObject.getPageSubtitle();
    const subtitleText = subtitle.trim();
    await t.expect(subtitleText).eql('Please insert your PIV / CAC card and select the user certificate.');
    await t.expect(pivPageObject.getErrorFromErrorBox()).eql('Unable to sign in');
  });
