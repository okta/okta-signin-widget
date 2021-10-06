import {RequestMock, RequestLogger, ClientFunction} from 'testcafe';
import DeviceCodeActivatePageObject from '../../framework/page-objects-v1/DeviceCodeActivatePageObject';

import legacyDeviceCodeActivateResponse from '../../../../playground/mocks/data/api/v1/authn/device-code-activate.json';
import legacyActivateResponse from '../../../../playground/mocks/data/api/v1/authn/unauthenticated-forced-idp-discovery.json';
import idpForceResponse from '../../../../playground/mocks/data/api/v1/authn/forced-idp-discovery.json';


// Legacy mocks
const legacyDeviceCodeSuccessMock = RequestMock()
  .onRequestTo('http://localhost:3000/api/v1/authn/introspect')
  .respond(legacyDeviceCodeActivateResponse)
  .onRequestTo('http://localhost:3000/api/v1/authn/device/activate')
  .respond(legacyActivateResponse)
  .onRequestTo('http://localhost:3000/.well-known/webfinger?resource=okta%3Aacct%3Aundefined&requestContext=okta%3AforcedIdpEvaluation%3AaStateToken')
  .respond(idpForceResponse)
  .onRequestTo('http://localhost:3000/sso/idps/0oa4onxsxfUDwUb8u0g4?fromURI=%2Foauth2%2Fv1%2Fauthorize%2Fredirect%3Fokta_key%3DRmNkmXAY-3wTxNLyw4k0WFmgPsWOYK_2-mU7inYRisg&login_hint=undefined#')
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
  await deviceCodeActivatePage.navigateToPage();
  requestLogger.clear();
  return deviceCodeActivatePage;
}

test.requestHooks(requestLogger, legacyDeviceCodeSuccessMock)('idp discovery after device activate', async t => {
  const deviceCodeActivatePageObject = await setup(t);
  await rerenderWidget({
    stateToken: '00-dummy-state-token', //start with 00 to render legacy sign in widget
  });

  // submit user code
  await deviceCodeActivatePageObject.setActivateCodeTextBoxValue('ABCDWXYZ');
  await deviceCodeActivatePageObject.clickNextButton();

  // check if spinner is visible
  //TODO await t.expect(deviceCodeActivatePageObject.isForcedIdpSpinnerPresent()).eql(true);

  const pageUrl = await deviceCodeActivatePageObject.getPageUrl();
  await t.expect(pageUrl)
    .eql('http://localhost:3000/sso/idps/0oa4onxsxfUDwUb8u0g4?fromURI=%2Foauth2%2Fv1%2Fauthorize%2Fredirect%3Fokta_key%3DRmNkmXAY-3wTxNLyw4k0WFmgPsWOYK_2-mU7inYRisg&login_hint=undefined#');

});