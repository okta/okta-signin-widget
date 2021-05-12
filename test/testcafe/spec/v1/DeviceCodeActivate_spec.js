import {RequestMock, RequestLogger, ClientFunction} from 'testcafe';
import DeviceCodeActivatePageObject from '../../framework/page-objects/DeviceCodeActivatePageObject';

import legacyDeviceCodeActivateResponse from '../../../../playground/mocks/data/api/v1/authn/device-code-activate.json';
import legacyDeviceActivatedTerminalResponse from '../../../../playground/mocks/data/api/v1/authn/terminal-device-activated.json';
import legacyDeviceNotActivatedConsentDeniedTerminalResponse from '../../../../playground/mocks/data/api/v1/authn/terminal-device-not-activated-consent-denied.json';
import legacyDeviceNotActivatedInternalErrorTerminalResponse from '../../../../playground/mocks/data/api/v1/authn/terminal-device-not-activated-internal-error.json';
import legacyInvalidDeviceCodeResponse from '../../../../playground/mocks/data/api/v1/authn/error-invalid-device-code.json';
import legacyActivateResponse from '../../../../playground/mocks/data/api/v1/authn/unauthenticated.json';

// Legacy mocks
const legacyDeviceCodeSuccessMock = RequestMock()
  .onRequestTo('http://localhost:3000/api/v1/authn/introspect')
  .respond(legacyDeviceCodeActivateResponse)
  .onRequestTo('http://localhost:3000/api/v1/authn/device/activate')
  .respond(legacyActivateResponse)
  .onRequestTo('http://localhost:3000/api/v1/authn')
  .respond(legacyDeviceActivatedTerminalResponse);

const legacyDeviceCodeConsentDeniedMock = RequestMock()
  .onRequestTo('http://localhost:3000/api/v1/authn/introspect')
  .respond(legacyDeviceCodeActivateResponse)
  .onRequestTo('http://localhost:3000/api/v1/authn/device/activate')
  .respond(legacyActivateResponse)
  .onRequestTo('http://localhost:3000/api/v1/authn')
  .respond(legacyDeviceNotActivatedConsentDeniedTerminalResponse);

const legacyDeviceCodeErrorMock = RequestMock()
  .onRequestTo('http://localhost:3000/api/v1/authn/introspect')
  .respond(legacyDeviceCodeActivateResponse)
  .onRequestTo('http://localhost:3000/api/v1/authn/device/activate')
  .respond(legacyActivateResponse)
  .onRequestTo('http://localhost:3000/api/v1/authn')
  .respond(legacyDeviceNotActivatedInternalErrorTerminalResponse);

const legacyInvalidDeviceCodeMock = RequestMock()
  .onRequestTo('http://localhost:3000/api/v1/authn/introspect')
  .respond(legacyDeviceCodeActivateResponse)
  .onRequestTo('http://localhost:3000/api/v1/authn/device/activate')
  .respond(legacyInvalidDeviceCodeResponse, 403);

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

fixture('Device Code Activation Flow legacy SIW');

async function setup(t) {
  const deviceCodeActivatePage = new DeviceCodeActivatePageObject(t);
  await deviceCodeActivatePage.navigateToPage();
  requestLogger.clear();
  return deviceCodeActivatePage;
}

test.requestHooks(requestLogger, legacyDeviceCodeSuccessMock)('should be able to complete device code activation flow on legacy SIW', async t => {
  const deviceCodeActivatePageObject = await setup(t);
  await rerenderWidget({
    stateToken: '00-dummy-state-token', //start with 00 to render legacy sign in widget
  });

  await t.expect(deviceCodeActivatePageObject.getPageTitle()).eql('Activate your device');
  await t.expect(deviceCodeActivatePageObject.getPageSubtitle()).eql('Follow the instructions on your device to get an activation code');
  await t.expect(await deviceCodeActivatePageObject.getActivationCodeTextBoxLabel()).eql('Activation Code');
  await t.expect(deviceCodeActivatePageObject.isActivateCodeTextBoxVisible()).eql(true);

  await t.expect(requestLogger.contains(record => record.request.url.match(/api\/v1\/authn\/introspect/))).eql(true);

  requestLogger.clear();

  // submit user code
  await deviceCodeActivatePageObject.setActivateCodeTextBoxValue('ABCDWXYZ');
  await deviceCodeActivatePageObject.clickNextButton();

  await t.expect(requestLogger.count(() => true)).eql(1);
  const req = requestLogger.requests[0].request;
  const reqBody = JSON.parse(req.body);
  await t.expect(reqBody).eql({
    userCode: 'ABCD-WXYZ',
    stateToken: '00-dummy-state-token',
  });
  await t.expect(req.method).eql('post');
  await t.expect(req.url).eql('http://localhost:3000/api/v1/authn/device/activate');

  requestLogger.clear();

  // identify with password
  await deviceCodeActivatePageObject.fillLegacyUserNameField('Test Identifier');
  await deviceCodeActivatePageObject.fillLegacyPasswordField('random password 123');
  await deviceCodeActivatePageObject.clickNextButton();

  await t.expect(requestLogger.count(() => true)).eql(1);
  const reqIdentify = requestLogger.requests[0].request;
  await t.expect(reqIdentify.method).eql('post');
  await t.expect(reqIdentify.url).eql('http://localhost:3000/api/v1/authn');

  // expect device activated screen
  await t.expect(deviceCodeActivatePageObject.getPageTitle()).eql('Device activated');
  await t.expect(deviceCodeActivatePageObject.getPageSubtitle()).eql('Follow the instructions on your device for next steps');
  await t.expect(deviceCodeActivatePageObject.isTerminalSuccessIconPresent()).eql(true);
  await t.expect(deviceCodeActivatePageObject.isBeaconTerminalPresent()).eql(false);
  await t.expect(deviceCodeActivatePageObject.isTryAgainButtonPresent()).eql(false);
});

test.requestHooks(legacyDeviceCodeConsentDeniedMock)('should be able to get device not activated screen when consent is denied on legacy SIW', async t => {
  const deviceCodeActivatePageObject = await setup(t);
  await rerenderWidget({
    stateToken: '00-dummy-state-token', //start with 00 to render legacy sign in widget
  });

  // submit user code
  await deviceCodeActivatePageObject.setActivateCodeTextBoxValue('ABCD-WXYZ');
  await deviceCodeActivatePageObject.clickNextButton();

  // identify with password
  await deviceCodeActivatePageObject.fillLegacyUserNameField('Test Identifier');
  await deviceCodeActivatePageObject.fillLegacyPasswordField('random password 123');
  await deviceCodeActivatePageObject.clickNextButton();

  // expect device not activated screen
  await t.expect(deviceCodeActivatePageObject.getPageTitle()).eql('Device not activated');
  await t.expect(deviceCodeActivatePageObject.getPageSubtitle()).contains('Your device cannot be activated because you did not allow access');
  await t.expect(deviceCodeActivatePageObject.isTerminalErrorIconPresent()).eql(true);
  await t.expect(deviceCodeActivatePageObject.isBeaconTerminalPresent()).eql(false);
  await t.expect(deviceCodeActivatePageObject.isTryAgainButtonPresent()).eql(true);
});

test.requestHooks(legacyDeviceCodeErrorMock)('should be able to get device not activated screen when there is an internal error on legacy SIW', async t => {
  const deviceCodeActivatePageObject = await setup(t);
  await rerenderWidget({
    stateToken: '00-dummy-state-token', //start with 00 to render legacy sign in widget
  });

  // submit user code
  await deviceCodeActivatePageObject.setActivateCodeTextBoxValue('ABCD-WXYZ');
  await deviceCodeActivatePageObject.clickNextButton();

  // identify with password
  await deviceCodeActivatePageObject.fillLegacyUserNameField('Test Identifier');
  await deviceCodeActivatePageObject.fillLegacyPasswordField('random password 123');
  await deviceCodeActivatePageObject.clickNextButton();

  // expect device not activated screen
  await t.expect(deviceCodeActivatePageObject.getPageTitle()).eql('Device not activated');
  await t.expect(deviceCodeActivatePageObject.getPageSubtitle()).contains('Your device cannot be activated because of an internal error');
  await t.expect(deviceCodeActivatePageObject.isTerminalErrorIconPresent()).eql(true);
  await t.expect(deviceCodeActivatePageObject.isBeaconTerminalPresent()).eql(false);
  await t.expect(deviceCodeActivatePageObject.isTryAgainButtonPresent()).eql(true);
});

test.requestHooks(legacyInvalidDeviceCodeMock)('should be able show error when wrong activation code is entered on legacy SIW', async t => {
  const deviceCodeActivatePageObject = await setup(t);
  await rerenderWidget({
    stateToken: '00-dummy-state-token', //start with 00 to render legacy sign in widget
  });

  await t.expect(deviceCodeActivatePageObject.isActivateCodeTextBoxVisible()).eql(true);
  await deviceCodeActivatePageObject.setActivateCodeTextBoxValue('ABCD-WXYZ');
  await deviceCodeActivatePageObject.clickNextButton();
  await t.expect(deviceCodeActivatePageObject.getLegacyErrorBoxText()).contains('Invalid code. Try again.');
});

test.requestHooks(requestLogger, legacyDeviceCodeSuccessMock)('should be able to add hyphen automatically after 4th char in activation code input on legacy SIW', async t => {
  const deviceCodeActivatePageObject = await setup(t);
  await rerenderWidget({
    stateToken: '00-dummy-state-token', //start with 00 to render legacy sign in widget
  });

  await t.expect(await deviceCodeActivatePageObject.getActivationCodeTextBoxLabel()).eql('Activation Code');
  await t.expect(deviceCodeActivatePageObject.isActivateCodeTextBoxVisible()).eql(true);

  await deviceCodeActivatePageObject.setActivateCodeTextBoxValue('ABCDE');
  // expect hyphen after 4th character
  await t.expect(deviceCodeActivatePageObject.getActivateCodeTextBoxValue()).eql('ABCD-E');
});