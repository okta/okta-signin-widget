import {RequestMock, RequestLogger, ClientFunction} from 'testcafe';
import DeviceCodeActivatePageObject from '../../framework/page-objects-v1/DeviceCodeActivatePageObject';
import IdentityPageObject from '../../framework/page-objects/IdentityPageObject';

import legacyDeviceCodeActivateResponse from '../../../../playground/mocks/data/api/v1/authn/device-code-activate.json';
import legacyUnauthenticatedWithUsingDeviceFlow from '../../../../playground/mocks/data/api/v1/authn/unauthenticated-using-device-flow.json';
import legacyUnauthenticated from '../../../../playground/mocks/data/api/v1/authn/unauthenticated.json';
import idpForceResponseLinkedInIdP from '../../../../playground/mocks/data/.well-known/webfinger/forced-idp-discovery-linkedin-idp.json';
import idpForceResponseOktaIdP from '../../../../playground/mocks/data/.well-known/webfinger/forced-idp-discovery-okta-idp.json';

// Legacy mocks
const legacyDeviceCodeIdpCheckWithRedirectionMock = wellKnownResponse => RequestMock()
  .onRequestTo('http://localhost:3000/api/v1/authn')
  .respond(legacyDeviceCodeActivateResponse)
  .onRequestTo('http://localhost:3000/api/v1/authn/introspect')
  .respond(legacyDeviceCodeActivateResponse)
  .onRequestTo('http://localhost:3000/api/v1/authn/device/activate')
  .respond(legacyUnauthenticatedWithUsingDeviceFlow)
  .onRequestTo(/^http:\/\/localhost:3000\/.well-known\/webfinger.*/)
  .respond(wellKnownResponse)
  .onRequestTo('http://localhost:3000/sso/idps/0oa4onxsxfUDwUb8u0g4?stateToken=00lpyQXxOMfE0lbVM1vEY4u3usVvlmkK5rDx69GQgb&login_hint=#')
  .respond('<html><h1>An external IdP login page for testcafe testing</h1></html>');
const legacyDeviceCodeIdpCheckWithRedirectionLinkedInIDPMock = legacyDeviceCodeIdpCheckWithRedirectionMock(idpForceResponseLinkedInIdP);
const legacyDeviceCodeIdpCheckWithRedirectionOktaIDPMock = legacyDeviceCodeIdpCheckWithRedirectionMock(idpForceResponseOktaIdP);

const legacyDeviceCodeForceIdpCheckWithoutRedirectionMock = RequestMock()
  .onRequestTo('http://localhost:3000/api/v1/authn')
  .respond(legacyDeviceCodeActivateResponse)
  .onRequestTo('http://localhost:3000/api/v1/authn/introspect')
  .respond(legacyDeviceCodeActivateResponse)
  .onRequestTo('http://localhost:3000/api/v1/authn/device/activate')
  .respond(legacyUnauthenticatedWithUsingDeviceFlow)
  .onRequestTo(/^http:\/\/localhost:3000\/.well-known\/webfinger.*/)
  .respond(idpForceResponseOktaIdP);

const legacyDeviceCodeForceIdpCheckWithoutRedirectionAndErrorMock = (wellKnownResponse, status) => RequestMock()
  .onRequestTo('http://localhost:3000/api/v1/authn')
  .respond(legacyDeviceCodeActivateResponse)
  .onRequestTo('http://localhost:3000/api/v1/authn/introspect')
  .respond(legacyDeviceCodeActivateResponse)
  .onRequestTo('http://localhost:3000/api/v1/authn/device/activate')
  .respond(legacyUnauthenticatedWithUsingDeviceFlow)
  .onRequestTo(/^http:\/\/localhost:3000\/.well-known\/webfinger.*/)
  .respond(wellKnownResponse, status);
const wellKnownSuccessMock = legacyDeviceCodeForceIdpCheckWithoutRedirectionAndErrorMock(idpForceResponseOktaIdP, 200);
const wellKnownErrorMock = legacyDeviceCodeForceIdpCheckWithoutRedirectionAndErrorMock(idpForceResponseOktaIdP, 400);

const legacyDeviceCodeShowLoginMock = RequestMock()
  .onRequestTo('http://localhost:3000/api/v1/authn')
  .respond(legacyDeviceCodeActivateResponse)
  .onRequestTo('http://localhost:3000/api/v1/authn/introspect')
  .respond(legacyDeviceCodeActivateResponse)
  .onRequestTo('http://localhost:3000/api/v1/authn/device/activate')
  .respond(legacyUnauthenticated)
  .onRequestTo(/^http:\/\/localhost:3000\/.well-known\/webfinger.*/)
  .respond(idpForceResponseOktaIdP);

const legacyDeviceCodeShowLoginMockWithUsingDeviceFlow = RequestMock()
  .onRequestTo('http://localhost:3000/api/v1/authn')
  .respond(legacyDeviceCodeActivateResponse)
  .onRequestTo('http://localhost:3000/api/v1/authn/introspect')
  .respond(legacyDeviceCodeActivateResponse)
  .onRequestTo(/^http:\/\/localhost:3000\/.well-known\/webfinger.*/)
  .respond(idpForceResponseOktaIdP)
  .onRequestTo('http://localhost:3000/api/v1/authn/device/activate')
  .respond(legacyUnauthenticatedWithUsingDeviceFlow)
  .onRequestTo('http://localhost:3000/sso/idps/0oaaix1twko0jyKik0g1?stateToken=aStateToken')
  .respond('<html><h1>An external IdP login page for testcafe testing</h1></html>');

const legacyDeviceCodeShowLoginMockWithoutDeviceFlow = RequestMock()
  .onRequestTo('http://localhost:3000/api/v1/authn')
  .respond(legacyDeviceCodeActivateResponse)
  .onRequestTo('http://localhost:3000/api/v1/authn/introspect')
  .respond(legacyDeviceCodeActivateResponse)
  .onRequestTo(/^http:\/\/localhost:3000\/.well-known\/webfinger.*/)
  .respond(idpForceResponseOktaIdP)
  .onRequestTo('http://localhost:3000/api/v1/authn/device/activate')
  .respond(legacyUnauthenticated)
  .onRequestTo('http://localhost:3000/sso/idps/0oaaix1twko0jyKik0g1?fromURI=')
  .respond('<html><h1>An external IdP login page for testcafe testing</h1></html>');


const requestLogger = RequestLogger(
  /api\/v1/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
  }
);

const rerenderWidget = ClientFunction((settings) => {
  window.renderPlaygroundWidget(settings);
});

fixture('IDP Discovery force');

async function setup(t) {
  const deviceCodeActivatePage = new DeviceCodeActivatePageObject(t);
  await deviceCodeActivatePage.navigateToPage({ render: false });
  requestLogger.clear();
  return deviceCodeActivatePage;
}

test.requestHooks(requestLogger, legacyDeviceCodeIdpCheckWithRedirectionOktaIDPMock)('force idp discovery after device activate and redirect to idp', async t => {
  const deviceCodeActivatePageObject = await setup(t);
  await rerenderWidget({
    stateToken: null, // setting stateToken to null to trigger the V1 flow
    features: {
      idpDiscovery: false,
    },
    authParams: {
      responseType: 'code',
    },
    useClassicEngine: true,
  });

  // login
  await deviceCodeActivatePageObject.form.setTextBoxValue('username', 'administrator@okta1.com');
  await deviceCodeActivatePageObject.form.setTextBoxValue('password', 'pass@word123');
  await deviceCodeActivatePageObject.form.clickSaveButton('Sign In');

  await t.expect(deviceCodeActivatePageObject.activationCodeFieldExists()).ok();

  await t.removeRequestHooks(legacyDeviceCodeIdpCheckWithRedirectionOktaIDPMock);
  await t.addRequestHooks(legacyDeviceCodeIdpCheckWithRedirectionLinkedInIDPMock);

  // submit user code
  await deviceCodeActivatePageObject.setActivateCodeTextBoxValue('ABCDWXYZ');
  await deviceCodeActivatePageObject.clickNextButton();

  const pageUrl = await deviceCodeActivatePageObject.getPageUrl();
  await t.expect(pageUrl)
    .eql('http://localhost:3000/sso/idps/0oa4onxsxfUDwUb8u0g4?stateToken=00lpyQXxOMfE0lbVM1vEY4u3usVvlmkK5rDx69GQgb&login_hint=#');
});

test.requestHooks(requestLogger, legacyDeviceCodeIdpCheckWithRedirectionOktaIDPMock)('force idp discovery after device activate w/idp discovery feature and redirect to idp', async t => {
  const deviceCodeActivatePageObject = await setup(t);
  await rerenderWidget({
    stateToken: null, // setting stateToken to null to trigger the V1 flow
    features: {
      router: false,
      idpDiscovery: true,
    },
    authParams: {
      responseType: 'code',
    },
    useClassicEngine: true,
  });

  // login
  await deviceCodeActivatePageObject.form.setTextBoxValue('username', 'administrator@okta1.com');
  await deviceCodeActivatePageObject.form.clickSaveButton();
  await t.expect(deviceCodeActivatePageObject.form.fieldByLabelExists('Password')).ok();
  await deviceCodeActivatePageObject.form.setTextBoxValue('password', 'pass@word123');
  await deviceCodeActivatePageObject.form.clickSaveButton('Sign In');

  await t.expect(deviceCodeActivatePageObject.activationCodeFieldExists()).ok();

  await t.removeRequestHooks(legacyDeviceCodeIdpCheckWithRedirectionOktaIDPMock);
  await t.addRequestHooks(legacyDeviceCodeIdpCheckWithRedirectionLinkedInIDPMock);

  // submit user code
  await deviceCodeActivatePageObject.setActivateCodeTextBoxValue('ABCDWXYZ');
  await deviceCodeActivatePageObject.clickNextButton();

  const pageUrl = await deviceCodeActivatePageObject.getPageUrl();
  await t.expect(pageUrl)
    .eql('http://localhost:3000/sso/idps/0oa4onxsxfUDwUb8u0g4?stateToken=00lpyQXxOMfE0lbVM1vEY4u3usVvlmkK5rDx69GQgb&login_hint=#');
});

test.requestHooks(requestLogger, wellKnownSuccessMock)('force idp discovery after device activate and error route to default route', async t => {
  const deviceCodeActivatePageObject = await setup(t);
  await rerenderWidget({
    stateToken: null, // setting stateToken to null to trigger the V1 flow
    features: {
      idpDiscovery: false,
    },
    authParams: {
      responseType: 'code',
    },
    useClassicEngine: true,
  });

  // login
  await deviceCodeActivatePageObject.form.setTextBoxValue('username', 'administrator@okta1.com');
  await deviceCodeActivatePageObject.form.setTextBoxValue('password', 'pass@word123');
  await deviceCodeActivatePageObject.form.clickSaveButton('Sign In');

  await t.expect(deviceCodeActivatePageObject.activationCodeFieldExists()).ok();

  await t.removeRequestHooks(wellKnownSuccessMock);
  await t.addRequestHooks(wellKnownErrorMock);

  // submit user code
  await deviceCodeActivatePageObject.setActivateCodeTextBoxValue('ABCDWXYZ');
  await deviceCodeActivatePageObject.clickNextButton();
  await t.expect(deviceCodeActivatePageObject.signInFormUsernameFieldExists()).ok();
  await t.expect(deviceCodeActivatePageObject.getFormTitle()).eql('Sign In');
  await t.expect(deviceCodeActivatePageObject.isUserNameFieldVisible()).eql(true);
  await t.expect(deviceCodeActivatePageObject.isPasswordFieldVisible()).eql(true);
});

test.requestHooks(requestLogger, wellKnownSuccessMock)('force idp discovery after device activate w/idp discovery and error route to default route', async t => {
  const deviceCodeActivatePageObject = await setup(t);
  await rerenderWidget({
    stateToken: null, // setting stateToken to null to trigger the V1 flow
    features: {
      router: false,
      idpDiscovery: true,
    },
    authParams: {
      responseType: 'code',
    },
    useClassicEngine: true,
  });

  // login
  await deviceCodeActivatePageObject.form.setTextBoxValue('username', 'administrator@okta1.com');
  await deviceCodeActivatePageObject.form.clickSaveButton();
  await t.expect(deviceCodeActivatePageObject.form.fieldByLabelExists('Password')).ok();
  await deviceCodeActivatePageObject.form.setTextBoxValue('password', 'pass@word123');
  await deviceCodeActivatePageObject.form.clickSaveButton('Sign In');

  await t.expect(deviceCodeActivatePageObject.activationCodeFieldExists()).ok();

  await t.removeRequestHooks(wellKnownSuccessMock);
  await t.addRequestHooks(wellKnownErrorMock);

  // submit user code
  await deviceCodeActivatePageObject.setActivateCodeTextBoxValue('ABCDWXYZ');
  await deviceCodeActivatePageObject.clickNextButton();
  await t.expect(deviceCodeActivatePageObject.signInFormUsernameFieldExists()).ok();
  await t.expect(deviceCodeActivatePageObject.getFormTitle()).eql('Sign In');
  await t.expect(deviceCodeActivatePageObject.isUserNameFieldVisible()).eql(true);
  await t.expect(deviceCodeActivatePageObject.isPasswordFieldVisible()).eql(false);
});

test.requestHooks(requestLogger, legacyDeviceCodeForceIdpCheckWithoutRedirectionMock)('force idp discovery after device activate and show username and password', async t => {
  const deviceCodeActivatePageObject = await setup(t);
  await rerenderWidget({
    stateToken: null, // setting stateToken to null to trigger the V1 flow
    features: {
      idpDiscovery: false,
    },
    authParams: {
      responseType: 'code',
    },
    useClassicEngine: true,
  });

  // login
  await deviceCodeActivatePageObject.form.setTextBoxValue('username', 'administrator@okta1.com');
  await deviceCodeActivatePageObject.form.setTextBoxValue('password', 'pass@word123');
  await deviceCodeActivatePageObject.form.clickSaveButton('Sign In');

  await t.expect(deviceCodeActivatePageObject.activationCodeFieldExists()).ok();

  // submit user code
  await deviceCodeActivatePageObject.setActivateCodeTextBoxValue('ABCDWXYZ');
  await deviceCodeActivatePageObject.clickNextButton();
  await t.expect(deviceCodeActivatePageObject.signInFormUsernameFieldExists()).ok();
  await t.expect(deviceCodeActivatePageObject.getFormTitle()).eql('Sign In');
  await t.expect(deviceCodeActivatePageObject.isUserNameFieldVisible()).eql(true);
  await t.expect(deviceCodeActivatePageObject.isPasswordFieldVisible()).eql(true);
});

test.requestHooks(requestLogger, legacyDeviceCodeForceIdpCheckWithoutRedirectionMock)('force idp discovery after device activate w/idp discovery feature and show username', async t => {
  const deviceCodeActivatePageObject = await setup(t);
  await rerenderWidget({
    stateToken: null, // setting stateToken to null to trigger the V1 flow
    features: {
      router: false,
      idpDiscovery: true,
    },
    authParams: {
      responseType: 'code',
    },
    useClassicEngine: true,
  });

  // login
  await deviceCodeActivatePageObject.form.setTextBoxValue('username', 'administrator@okta1.com');
  await deviceCodeActivatePageObject.form.clickSaveButton();
  await t.expect(deviceCodeActivatePageObject.form.fieldByLabelExists('Password')).ok();
  await deviceCodeActivatePageObject.form.setTextBoxValue('password', 'pass@word123');
  await deviceCodeActivatePageObject.form.clickSaveButton('Sign In');

  await t.expect(deviceCodeActivatePageObject.activationCodeFieldExists()).ok();

  // submit user code
  await deviceCodeActivatePageObject.setActivateCodeTextBoxValue('ABCDWXYZ');
  await deviceCodeActivatePageObject.clickNextButton();
  await t.expect(deviceCodeActivatePageObject.signInFormUsernameFieldExists()).ok();
  await t.expect(deviceCodeActivatePageObject.getFormTitle()).eql('Sign In');
  await t.expect(deviceCodeActivatePageObject.isUserNameFieldVisible()).eql(true);
  await t.expect(deviceCodeActivatePageObject.isPasswordFieldVisible()).eql(false);
});

test.requestHooks(requestLogger, legacyDeviceCodeShowLoginMock)('no idp discovery after device activate and show username and password', async t => {
  const deviceCodeActivatePageObject = await setup(t);
  await rerenderWidget({
    stateToken: null, // setting stateToken to null to trigger the V1 flow
    features: {
      idpDiscovery: false,
    },
    authParams: {
      responseType: 'code',
    },
    useClassicEngine: true,
  });

  // login
  await deviceCodeActivatePageObject.form.setTextBoxValue('username', 'administrator@okta1.com');
  await deviceCodeActivatePageObject.form.setTextBoxValue('password', 'pass@word123');
  await deviceCodeActivatePageObject.form.clickSaveButton('Sign In');

  await t.expect(deviceCodeActivatePageObject.activationCodeFieldExists()).ok();

  // submit user code
  await deviceCodeActivatePageObject.setActivateCodeTextBoxValue('ABCDWXYZ');
  await deviceCodeActivatePageObject.clickNextButton();
  await t.expect(deviceCodeActivatePageObject.signInFormUsernameFieldExists()).ok();
  await t.expect(deviceCodeActivatePageObject.getFormTitle()).eql('Sign In');
  await t.expect(deviceCodeActivatePageObject.isUserNameFieldVisible()).eql(true);
  await t.expect(deviceCodeActivatePageObject.isPasswordFieldVisible()).eql(true);
});

test.requestHooks(requestLogger, legacyDeviceCodeShowLoginMock)('idp discovery after device activate and show username only', async t => {
  const deviceCodeActivatePageObject = await setup(t);
  await rerenderWidget({
    stateToken: null, // setting stateToken to null to trigger the V1 flow
    features: {
      router: false,
      idpDiscovery: true,
    },
    authParams: {
      responseType: 'code',
    },
    useClassicEngine: true,
  });

  // login
  await deviceCodeActivatePageObject.form.setTextBoxValue('username', 'administrator@okta1.com');
  await deviceCodeActivatePageObject.form.clickSaveButton();
  await t.expect(deviceCodeActivatePageObject.form.fieldByLabelExists('Password')).ok();
  await deviceCodeActivatePageObject.form.setTextBoxValue('password', 'pass@word123');
  await deviceCodeActivatePageObject.form.clickSaveButton('Sign In');

  await t.expect(deviceCodeActivatePageObject.activationCodeFieldExists()).ok();

  // submit user code
  await deviceCodeActivatePageObject.setActivateCodeTextBoxValue('ABCDWXYZ');
  await deviceCodeActivatePageObject.clickNextButton();
  await t.expect(deviceCodeActivatePageObject.signInFormUsernameFieldExists()).ok();
  await t.expect(deviceCodeActivatePageObject.getFormTitle()).eql('Sign In');
  await t.expect(deviceCodeActivatePageObject.isUserNameFieldVisible()).eql(true);
  await t.expect(deviceCodeActivatePageObject.isPasswordFieldVisible()).eql(false);
});

test.requestHooks(requestLogger, legacyDeviceCodeShowLoginMockWithoutDeviceFlow)('social login after device activate and redirect with from uri', async t => {
  const deviceCodeActivatePageObject = await setup(t);
  const identityPage = new IdentityPageObject(t);
  await rerenderWidget({
    stateToken: null, // setting stateToken to null to trigger the V1 flow
    authScheme: '',
    features: {
      router: false,
      idpDiscovery: true,
    },
    authParams: {
      responseType: 'code',
      codeChallenge: 'dummy-code-challenge',
    },
    useClassicEngine: true,
    idps: [
      {type: 'GOOGLE', id: '0oaaix1twko0jyKik0g1'}
    ]
  });

  // login
  await deviceCodeActivatePageObject.form.setTextBoxValue('username', 'administrator@okta1.com');
  await deviceCodeActivatePageObject.form.clickSaveButton();
  await t.expect(deviceCodeActivatePageObject.form.fieldByLabelExists('Password')).ok();
  await deviceCodeActivatePageObject.form.setTextBoxValue('password', 'pass@word123');
  await deviceCodeActivatePageObject.form.clickSaveButton('Sign In');

  await t.expect(deviceCodeActivatePageObject.activationCodeFieldExists()).ok();

  // submit user code
  await deviceCodeActivatePageObject.setActivateCodeTextBoxValue('ABCDWXYZ');
  await deviceCodeActivatePageObject.clickNextButton();
  await t.expect(deviceCodeActivatePageObject.signInFormUsernameFieldExists()).ok();
  await t.expect(deviceCodeActivatePageObject.getFormTitle()).eql('Sign In');
  await t.expect(deviceCodeActivatePageObject.isUserNameFieldVisible()).eql(true);
  await t.expect(deviceCodeActivatePageObject.isPasswordFieldVisible()).eql(false);
  await t.click('.social-auth-google-button');
  await t.expect(deviceCodeActivatePageObject.hasIDPRedirectPageHeader()).ok();
  const pageUrl = await identityPage.getPageUrl();
  // using fromUri
  await t.expect(pageUrl).eql('http://localhost:3000/sso/idps/0oaaix1twko0jyKik0g1?fromURI=');
});

test.requestHooks(requestLogger, legacyDeviceCodeShowLoginMockWithUsingDeviceFlow)('social login after device activate and redirect with state token', async t => {
  const deviceCodeActivatePageObject = await setup(t);
  const identityPage = new IdentityPageObject(t);
  await rerenderWidget({
    stateToken: null, // setting stateToken to null to trigger the V1 flow
    authScheme: '',
    features: {
      router: false,
      idpDiscovery: true,
    },
    authParams: {
      responseType: 'code',
      codeChallenge: 'dummy-code-challenge',
    },
    useClassicEngine: true,
    idps: [
      {type: 'GOOGLE', id: '0oaaix1twko0jyKik0g1'}
    ]
  });

  // login
  await deviceCodeActivatePageObject.form.setTextBoxValue('username', 'administrator@okta1.com');
  await deviceCodeActivatePageObject.form.clickSaveButton();
  await t.expect(deviceCodeActivatePageObject.form.fieldByLabelExists('Password')).ok();
  await deviceCodeActivatePageObject.form.setTextBoxValue('password', 'pass@word123');
  await deviceCodeActivatePageObject.form.clickSaveButton('Sign In');

  await t.expect(deviceCodeActivatePageObject.activationCodeFieldExists()).ok();

  // submit user code
  await deviceCodeActivatePageObject.setActivateCodeTextBoxValue('ABCDWXYZ');
  await deviceCodeActivatePageObject.clickNextButton();
  await t.expect(deviceCodeActivatePageObject.signInFormUsernameFieldExists()).ok();
  await t.expect(deviceCodeActivatePageObject.getFormTitle()).eql('Sign In');
  await t.expect(deviceCodeActivatePageObject.isUserNameFieldVisible()).eql(true);
  await t.expect(deviceCodeActivatePageObject.isPasswordFieldVisible()).eql(false);
  await t.click('.social-auth-google-button');
  await t.expect(deviceCodeActivatePageObject.hasIDPRedirectPageHeader()).ok();
  const pageUrl = await identityPage.getPageUrl();
  // using stateToken
  await t.expect(pageUrl).eql('http://localhost:3000/sso/idps/0oaaix1twko0jyKik0g1?stateToken=aStateToken');
});