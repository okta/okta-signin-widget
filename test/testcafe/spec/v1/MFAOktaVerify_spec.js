import { RequestMock, RequestLogger, ClientFunction } from 'testcafe';
import PrimaryAuthPageObject from '../../framework/page-objects-v1/PrimaryAuthPageObject';
import authnMfaOVRequiredResponse from '../../../../playground/mocks/data/api/v1/authn/mfa-required-oktaverify';
import wellKnownMockResponse from '../../../../playground/mocks/data/oauth2/well-known-openid-configuration';
import SuccessResponse from '../../../../playground/mocks/data/api/v1/authn/success-001';
import MFAOktaVerifyPageObject from '../../framework/page-objects-v1/MFAOktaVerifyPageObject';

const renderWidget = ClientFunction((settings) => {
  // function `renderPlaygroundWidget` is defined in playground/main.js
  window.renderPlaygroundWidget(settings);
});

const authNMfaOktaVerifyMock = RequestMock()
  .onRequestTo('http://localhost:3000/api/v1/authn')
  .respond(authnMfaOVRequiredResponse)
  .onRequestTo(/^http:\/\/localhost:3000\/api\/v1\/authn\/factors\/(.*)\/verify.*/)
  .respond(SuccessResponse)
  .onRequestTo(/^http:\/\/localhost:3000\/.well-known\/openid-configuration.*/)
  .respond(wellKnownMockResponse);

fixture('MFA Okta Verify Form').meta('gen1', true);

const logger = RequestLogger(
  /api\/v1/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
    logResponseBody: true,
  }
);

const defaultConfig = {
  stateToken: null, // setting stateToken to null to trigger the V1 flow
  clientId: 'someClientId',
  baseUrl: 'http://localhost:3000',
  authScheme: 'oauth2',
  redirectUri: 'http://localhost:3000',
  features: {
    router: false,
  },
  assets: {
    baseUrl: 'http://localhost:3000'
  },
  authParams: {
    responseType: 'code',
    issuer: 'http://localhost:3000',
    // headers: {},
    // ignoreSignature: true,
    codeChallenge: 'dummy-code-challenge',
    pkce: true,
  },
  useClassicEngine: true,
};

async function setup(t, config = defaultConfig) {
  const primaryAuthPage = new PrimaryAuthPageObject(t);
  await primaryAuthPage.navigateToPage({ render: false });

  await renderWidget(config);
  await t.expect(primaryAuthPage.formExists()).eql(true);
  return primaryAuthPage;
}

test.requestHooks(logger, authNMfaOktaVerifyMock)('uses PKCE by default', async (t) => {
  const primaryAuthForm = await setup(t);

  await t.expect(primaryAuthForm.getFormTitle()).eql('Sign In');
  await primaryAuthForm.form.setTextBoxValue('username', 'administrator@okta1.com');
  await primaryAuthForm.form.setTextBoxValue('password', 'pass@word123');
  await primaryAuthForm.clickNextButton('Sign In');

  const ovPageObject = new MFAOktaVerifyPageObject(t);
  await t.expect(ovPageObject.oktaVerifyBeaconExists()).ok();
  await ovPageObject.clickLinkElement('Or enter code');
  await ovPageObject.setCodeValue('543210');
  await ovPageObject.clickLinkElement('Verify');
  
  await t.expect(ovPageObject.hasIframe()).ok();
  const iframe = ovPageObject.getIframe();
  const iframeSrc  = await iframe.getAttribute('src');
  const urlParams = ovPageObject.parseAuthorizeUrlParams(iframeSrc);
  await t.expect(urlParams.get('client_id')).eql('someClientId');
  await t.expect(urlParams.get('redirect_uri')).eql('http://localhost:3000');
  await t.expect(urlParams.get('response_mode')).eql('okta_post_message');
  await t.expect(urlParams.get('response_type')).eql('code');
  await t.expect(urlParams.get('code_challenge_method')).eql('S256');
  await t.expect(urlParams.get('prompt')).eql('none');
  
});

test.requestHooks(logger, authNMfaOktaVerifyMock)('can redirect with PKCE flow', async (t) => {
  const config = {
    ...defaultConfig,
    redirect: 'always',
  };
  const primaryAuthForm = await setup(t, config);

  await t.expect(primaryAuthForm.getFormTitle()).eql('Sign In');
  await primaryAuthForm.form.setTextBoxValue('username', 'administrator@okta1.com');
  await primaryAuthForm.form.setTextBoxValue('password', 'pass@word123');
  await primaryAuthForm.clickNextButton('Sign In');

  const ovPageObject = new MFAOktaVerifyPageObject(t);
  await t.expect(ovPageObject.oktaVerifyBeaconExists()).ok();
  await ovPageObject.clickLinkElement('Or enter code');
  await ovPageObject.setCodeValue('543210');
  await ovPageObject.clickLinkElement('Verify');

  const pageUrl = await ovPageObject.getPageUrl();
  await t.expect(pageUrl)
    .contains('http://localhost:3000/oauth2/v1/authorize?client_id=someClientId&code_challenge=dummy-code-challenge&code_challenge_method=S256');
  const urlParams = ovPageObject.parseAuthorizeUrlParams(pageUrl);
  await t.expect(urlParams.get('client_id')).eql('someClientId');
  await t.expect(urlParams.get('redirect_uri')).eql('http://localhost:3000');
  await t.expect(urlParams.get('response_type')).eql('code');
  await t.expect(urlParams.get('code_challenge_method')).eql('S256');
});

test.requestHooks(logger, authNMfaOktaVerifyMock)('can redirect with PKCE flow and responseMode "fragment"', async (t) => {
  const config = {
    ...defaultConfig,
    redirect: 'always',
    authParams: {
      ...defaultConfig.authParams,
      responseMode: 'fragment',
    },
  };
  const primaryAuthForm = await setup(t, config);

  await t.expect(primaryAuthForm.getFormTitle()).eql('Sign In');
  await primaryAuthForm.form.setTextBoxValue('username', 'administrator@okta1.com');
  await primaryAuthForm.form.setTextBoxValue('password', 'pass@word123');
  await primaryAuthForm.clickNextButton('Sign In');

  const ovPageObject = new MFAOktaVerifyPageObject(t);
  await t.expect(ovPageObject.oktaVerifyBeaconExists()).ok();
  await ovPageObject.clickLinkElement('Or enter code');
  await ovPageObject.setCodeValue('543210');
  await ovPageObject.clickLinkElement('Verify');

  const pageUrl = await ovPageObject.getPageUrl();
  await t.expect(pageUrl)
    .contains('http://localhost:3000/oauth2/v1/authorize?client_id=someClientId&code_challenge=dummy-code-challenge&code_challenge_method=S256');
  const urlParams = ovPageObject.parseAuthorizeUrlParams(pageUrl);
  await t.expect(urlParams.get('client_id')).eql('someClientId');
  await t.expect(urlParams.get('redirect_uri')).eql('http://localhost:3000');
  await t.expect(urlParams.get('response_type')).eql('code');
  await t.expect(urlParams.get('code_challenge_method')).eql('S256');
  await t.expect(urlParams.get('response_mode')).eql('fragment');
});
