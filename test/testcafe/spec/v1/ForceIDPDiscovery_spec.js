import {RequestMock, RequestLogger, ClientFunction} from 'testcafe';
import DeviceCodeActivatePageObject from '../../framework/page-objects-v1/DeviceCodeActivatePageObject';

import legacyDeviceCodeActivateResponse from '../../../../playground/mocks/data/api/v1/authn/device-code-activate.json';
import legacyUnauthenticatedWithForceIdP from '../../../../playground/mocks/data/api/v1/authn/unauthenticated-forced-idp-discovery.json';
import legacyUnauthenticated from '../../../../playground/mocks/data/api/v1/authn/unauthenticated.json';
import idpForceResponseLinkedInIdP from '../../../../playground/mocks/data/.well-known/webfinger/forced-idp-discovery-linkedin-idp.json';
import idpForceResponseOktaIdP from '../../../../playground/mocks/data/.well-known/webfinger/forced-idp-discovery-okta-idp.json';

// Legacy mocks
const legacyDeviceCodeIdpCheckWithRedirectionMock = RequestMock()
  .onRequestTo('http://localhost:3000/api/v1/authn/introspect')
  .respond(legacyDeviceCodeActivateResponse)
  .onRequestTo('http://localhost:3000/api/v1/authn/device/activate')
  .respond(legacyUnauthenticatedWithForceIdP)
  .onRequestTo('http://localhost:3000/.well-known/webfinger?resource=okta%3Aacct%3A&requestContext=aStateToken')
  .respond(idpForceResponseLinkedInIdP)
  .onRequestTo('http://localhost:3000/sso/idps/0oa4onxsxfUDwUb8u0g4?stateToken=00lpyQXxOMfE0lbVM1vEY4u3usVvlmkK5rDx69GQgb&login_hint=#')
  .respond('<html><h1>An external IdP login page for testcafe testing</h1></html>');

const legacyDeviceCodeForceIdpCheckWithoutRedirectionMock = RequestMock()
  .onRequestTo('http://localhost:3000/api/v1/authn/introspect')
  .respond(legacyDeviceCodeActivateResponse)
  .onRequestTo('http://localhost:3000/api/v1/authn/device/activate')
  .respond(legacyUnauthenticatedWithForceIdP)
  .onRequestTo('http://localhost:3000/.well-known/webfinger?resource=okta%3Aacct%3A&requestContext=aStateToken')
  .respond(idpForceResponseOktaIdP);

const legacyDeviceCodeForceIdpCheckWithoutRedirectionAndErrorMock = RequestMock()
  .onRequestTo('http://localhost:3000/api/v1/authn/introspect')
  .respond(legacyDeviceCodeActivateResponse)
  .onRequestTo('http://localhost:3000/api/v1/authn/device/activate')
  .respond(legacyUnauthenticatedWithForceIdP)
  .onRequestTo('http://localhost:3000/.well-known/webfinger?resource=okta%3Aacct%3A&requestContext=aStateToken')
  .respond(idpForceResponseOktaIdP, 400);

const legacyDeviceCodeShowLoginMock = RequestMock()
  .onRequestTo('http://localhost:3000/api/v1/authn/introspect')
  .respond(legacyDeviceCodeActivateResponse)
  .onRequestTo('http://localhost:3000/api/v1/authn/device/activate')
  .respond(legacyUnauthenticated);

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
  await deviceCodeActivatePage.navigateToPage();
  requestLogger.clear();
  return deviceCodeActivatePage;
}

test.requestHooks(requestLogger, legacyDeviceCodeIdpCheckWithRedirectionMock)('force idp discovery after device activate and redirect to idp', async t => {
  const deviceCodeActivatePageObject = await setup(t);
  await rerenderWidget({
    stateToken: '00-dummy-state-token', //start with 00 to render legacy sign in widget
  });

  // submit user code
  await deviceCodeActivatePageObject.setActivateCodeTextBoxValue('ABCDWXYZ');
  await deviceCodeActivatePageObject.clickNextButton();

  const pageUrl = await deviceCodeActivatePageObject.getPageUrl();
  await t.expect(pageUrl)
    .eql('http://localhost:3000/sso/idps/0oa4onxsxfUDwUb8u0g4?stateToken=00lpyQXxOMfE0lbVM1vEY4u3usVvlmkK5rDx69GQgb&login_hint=#');
});

test.requestHooks(requestLogger, legacyDeviceCodeIdpCheckWithRedirectionMock)('force idp discovery after device activate w/idp discovery feature and redirect to idp', async t => {
  const deviceCodeActivatePageObject = await setup(t);
  await rerenderWidget({
    stateToken: '00-dummy-state-token', //start with 00 to render legacy sign in widget
    features: {
      idpDiscovery: true
    }
  });

  // submit user code
  await deviceCodeActivatePageObject.setActivateCodeTextBoxValue('ABCDWXYZ');
  await deviceCodeActivatePageObject.clickNextButton();

  const pageUrl = await deviceCodeActivatePageObject.getPageUrl();
  await t.expect(pageUrl)
    .eql('http://localhost:3000/sso/idps/0oa4onxsxfUDwUb8u0g4?stateToken=00lpyQXxOMfE0lbVM1vEY4u3usVvlmkK5rDx69GQgb&login_hint=#');
});

test.requestHooks(requestLogger, legacyDeviceCodeForceIdpCheckWithoutRedirectionAndErrorMock)('force idp discovery after device activate and error route to default route', async t => {
  const deviceCodeActivatePageObject = await setup(t);
  await rerenderWidget({
    stateToken: '00-dummy-state-token', //start with 00 to render legacy sign in widget
  });

  // submit user code
  await deviceCodeActivatePageObject.setActivateCodeTextBoxValue('ABCDWXYZ');
  await deviceCodeActivatePageObject.clickNextButton();
  await t.expect(deviceCodeActivatePageObject.getPageTitle()).eql('Sign In');
  await t.expect(deviceCodeActivatePageObject.isUserNameFieldVisible()).eql(true);
  await t.expect(deviceCodeActivatePageObject.isPasswordFieldVisible()).eql(true);
});

test.requestHooks(requestLogger, legacyDeviceCodeForceIdpCheckWithoutRedirectionAndErrorMock)('force idp discovery after device activate w/idp discovery and error route to default route', async t => {
  const deviceCodeActivatePageObject = await setup(t);
  await rerenderWidget({
    stateToken: '00-dummy-state-token', //start with 00 to render legacy sign in widget
    features: {
      idpDiscovery: true
    }
  });

  // submit user code
  await deviceCodeActivatePageObject.setActivateCodeTextBoxValue('ABCDWXYZ');
  await deviceCodeActivatePageObject.clickNextButton();
  await t.expect(deviceCodeActivatePageObject.getPageTitle()).eql('Sign In');
  await t.expect(deviceCodeActivatePageObject.isUserNameFieldVisible()).eql(true);
  await t.expect(deviceCodeActivatePageObject.isPasswordFieldVisible()).eql(false);
});

test.requestHooks(requestLogger, legacyDeviceCodeForceIdpCheckWithoutRedirectionMock)('force idp discovery after device activate and show username and password', async t => {
  const deviceCodeActivatePageObject = await setup(t);
  await rerenderWidget({
    stateToken: '00-dummy-state-token', //start with 00 to render legacy sign in widget
  });

  // submit user code
  await deviceCodeActivatePageObject.setActivateCodeTextBoxValue('ABCDWXYZ');
  await deviceCodeActivatePageObject.clickNextButton();
  await t.expect(deviceCodeActivatePageObject.getPageTitle()).eql('Sign In');
  await t.expect(deviceCodeActivatePageObject.isUserNameFieldVisible()).eql(true);
  await t.expect(deviceCodeActivatePageObject.isPasswordFieldVisible()).eql(true);
});

test.requestHooks(requestLogger, legacyDeviceCodeForceIdpCheckWithoutRedirectionMock)('force idp discovery after device activate w/idp discovery feature and show username', async t => {
  const deviceCodeActivatePageObject = await setup(t);
  await rerenderWidget({
    stateToken: '00-dummy-state-token', //start with 00 to render legacy sign in widget
    features: {
      idpDiscovery: true
    }
  });

  // submit user code
  await deviceCodeActivatePageObject.setActivateCodeTextBoxValue('ABCDWXYZ');
  await deviceCodeActivatePageObject.clickNextButton();
  await t.expect(deviceCodeActivatePageObject.getPageTitle()).eql('Sign In');
  await t.expect(deviceCodeActivatePageObject.isUserNameFieldVisible()).eql(true);
  await t.expect(deviceCodeActivatePageObject.isPasswordFieldVisible()).eql(false);
});

test.requestHooks(requestLogger, legacyDeviceCodeShowLoginMock)('no idp discovery after device activate and show username and password', async t => {
  const deviceCodeActivatePageObject = await setup(t);
  await rerenderWidget({
    stateToken: '00-dummy-state-token', //start with 00 to render legacy sign in widget
  });

  // submit user code
  await deviceCodeActivatePageObject.setActivateCodeTextBoxValue('ABCDWXYZ');
  await deviceCodeActivatePageObject.clickNextButton();
  await t.expect(deviceCodeActivatePageObject.getPageTitle()).eql('Sign In');
  await t.expect(deviceCodeActivatePageObject.isUserNameFieldVisible()).eql(true);
  await t.expect(deviceCodeActivatePageObject.isPasswordFieldVisible()).eql(true);
});

test.requestHooks(requestLogger, legacyDeviceCodeShowLoginMock)('idp discovery after device activate and show username only', async t => {
  const deviceCodeActivatePageObject = await setup(t);
  await rerenderWidget({
    stateToken: '00-dummy-state-token', //start with 00 to render legacy sign in widget
    features: {
      idpDiscovery: true
    }
  });

  // submit user code
  await deviceCodeActivatePageObject.setActivateCodeTextBoxValue('ABCDWXYZ');
  await deviceCodeActivatePageObject.clickNextButton();
  await t.expect(deviceCodeActivatePageObject.getPageTitle()).eql('Sign In');
  await t.expect(deviceCodeActivatePageObject.isUserNameFieldVisible()).eql(true);
  await t.expect(deviceCodeActivatePageObject.isPasswordFieldVisible()).eql(false);
});