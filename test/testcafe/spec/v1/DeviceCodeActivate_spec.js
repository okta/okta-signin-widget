import {RequestMock, RequestLogger, ClientFunction} from 'testcafe';
import DeviceCodeActivatePageObject from '../../framework/page-objects-v1/DeviceCodeActivatePageObject';

import legacyDeviceCodeActivateResponse from '../../../../playground/mocks/data/api/v1/authn/device-code-activate.json';
import legacyDeviceActivatedTerminalResponse from '../../../../playground/mocks/data/api/v1/authn/terminal-device-activated.json';
import legacyDeviceNotActivatedConsentDeniedTerminalResponse from '../../../../playground/mocks/data/api/v1/authn/terminal-device-not-activated-consent-denied.json';
import legacyDeviceNotActivatedInternalErrorTerminalResponse from '../../../../playground/mocks/data/api/v1/authn/terminal-device-not-activated-internal-error.json';
import legacyInvalidDeviceCodeResponse from '../../../../playground/mocks/data/api/v1/authn/error-invalid-device-code.json';
import legacyDeviceCodeActivateErrorResponse from '../../../../playground/mocks/data/api/v1/authn/error-device-code-activate.json';
import legacyActivateResponse from '../../../../playground/mocks/data/api/v1/authn/unauthenticated.json';
import legacyDeviceCodeActivateWithUserCodeResponse from '../../../../playground/mocks/data/api/v1/authn/device-code-activate-userCode.json';

// Legacy mocks
const legacyDeviceCodeSuccessMock = authNResponse => RequestMock()
  .onRequestTo('http://localhost:3000/api/v1/authn')
  .respond(authNResponse)
  .onRequestTo('http://localhost:3000/api/v1/authn/introspect')
  .respond(legacyDeviceCodeActivateResponse)
  .onRequestTo('http://localhost:3000/api/v1/authn/device/activate')
  .respond(legacyActivateResponse);
const legacyDeviceCodeSuccessMockCodeActivate = legacyDeviceCodeSuccessMock(legacyDeviceCodeActivateResponse);
const legacyDeviceCodeSuccessMockTerminal = legacyDeviceCodeSuccessMock(legacyDeviceActivatedTerminalResponse);

const legacyDeviceCodeConsentDeniedMock = authNResponse => RequestMock()
  .onRequestTo('http://localhost:3000/api/v1/authn')
  .respond(authNResponse)
  .onRequestTo('http://localhost:3000/api/v1/authn/introspect')
  .respond(legacyDeviceCodeActivateResponse)
  .onRequestTo('http://localhost:3000/api/v1/authn/device/activate')
  .respond(legacyActivateResponse);
const legacyDeviceCodeConsentDeniedMockCodeActivate = legacyDeviceCodeConsentDeniedMock(legacyDeviceCodeActivateResponse);
const legacyDeviceCodeConsentDeniedMockTerminal = legacyDeviceCodeConsentDeniedMock(legacyDeviceNotActivatedConsentDeniedTerminalResponse);

const legacyDeviceCodeErrorMock = authNResponse => RequestMock()
  .onRequestTo('http://localhost:3000/api/v1/authn')
  .respond(authNResponse)
  .onRequestTo('http://localhost:3000/api/v1/authn/introspect')
  .respond(legacyDeviceCodeActivateResponse)
  .onRequestTo('http://localhost:3000/api/v1/authn/device/activate')
  .respond(legacyActivateResponse);
const legacyDeviceCodeErrorMockCodeActivate = legacyDeviceCodeErrorMock(legacyDeviceCodeActivateResponse);
const legacyDeviceCodeErrorMockTerminal = legacyDeviceCodeErrorMock(legacyDeviceNotActivatedInternalErrorTerminalResponse);

const legacyInvalidDeviceCodeMock = RequestMock()
  .onRequestTo('http://localhost:3000/api/v1/authn')
  .respond(legacyDeviceCodeActivateResponse)
  .onRequestTo('http://localhost:3000/api/v1/authn/introspect')
  .respond(legacyDeviceCodeActivateResponse)
  .onRequestTo('http://localhost:3000/api/v1/authn/device/activate')
  .respond(legacyInvalidDeviceCodeResponse, 403);

const deviceCodeInvalidUserCodeMock = RequestMock()
  .onRequestTo('http://localhost:3000/api/v1/authn')
  .respond(legacyDeviceCodeActivateErrorResponse)
  .onRequestTo('http://localhost:3000/api/v1/authn/introspect')
  .respond(legacyDeviceCodeActivateErrorResponse)
  .onRequestTo('http://localhost:3000/api/v1/authn/device/activate')
  .respond(legacyActivateResponse);

const legacyDeviceCodeSuccessWithUserCodeMock = authNResponse => RequestMock()
  .onRequestTo('http://localhost:3000/api/v1/authn')
  .respond(authNResponse)
  .onRequestTo('http://localhost:3000/api/v1/authn/introspect')
  .respond(legacyDeviceCodeActivateWithUserCodeResponse)
  .onRequestTo('http://localhost:3000/api/v1/authn/device/activate')
  .respond(legacyActivateResponse);
const legacyDeviceCodeSuccessWithUserCodeMockActivateCode = legacyDeviceCodeSuccessWithUserCodeMock(legacyDeviceCodeActivateWithUserCodeResponse);
const legacyDeviceCodeSuccessWithUserCodeMockTerminal = legacyDeviceCodeSuccessWithUserCodeMock(legacyDeviceActivatedTerminalResponse);

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

fixture('Device Code Activation Flow legacy SIW').meta('gen1', true);

async function setup(t) {
  const deviceCodeActivatePage = new DeviceCodeActivatePageObject(t);
  await deviceCodeActivatePage.navigateToPage();
  requestLogger.clear();
  return deviceCodeActivatePage;
}

test.requestHooks(requestLogger, legacyDeviceCodeSuccessMockCodeActivate)('should be able to complete device code activation flow on legacy SIW', async t => {
  const deviceCodeActivatePageObject = await setup(t);
  await rerenderWidget({
    stateToken: null, // render legacy sign in widget
    authParams: {
      responseType: 'code',
    },
    useClassicEngine: true,
  });

  // login
  await deviceCodeActivatePageObject.form.setTextBoxValue('username', 'administrator@okta1.com');
  await deviceCodeActivatePageObject.form.setTextBoxValue('password', 'pass@word123');
  await deviceCodeActivatePageObject.form.clickSaveButton('Sign In');

  await t.expect(deviceCodeActivatePageObject.isActivateCodeTextBoxVisible()).eql(true);
  await t.expect(deviceCodeActivatePageObject.getFormTitle()).eql('Activate your device');
  await t.expect(deviceCodeActivatePageObject.getPageSubtitle()).eql('Follow the instructions on your device to get an activation code');
  await t.expect(await deviceCodeActivatePageObject.getActivationCodeTextBoxLabel()).eql('Activation Code');

  await t.expect(requestLogger.contains(record => record.request.url.match(/api\/v1\/authn/))).eql(true);

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

  await t.removeRequestHooks(legacyDeviceCodeSuccessMockCodeActivate);
  await t.addRequestHooks(legacyDeviceCodeSuccessMockTerminal);

  // identify with password
  await t.expect(deviceCodeActivatePageObject.signInFormUsernameFieldExists()).ok();
  await deviceCodeActivatePageObject.fillUserNameField('Test Identifier');
  await deviceCodeActivatePageObject.fillPasswordField('random password 123');
  await deviceCodeActivatePageObject.clickNextButton();

  await t.expect(requestLogger.count(() => true)).eql(1);
  const reqIdentify = requestLogger.requests[0].request;
  await t.expect(reqIdentify.method).eql('post');
  await t.expect(reqIdentify.url).eql('http://localhost:3000/api/v1/authn');

  // expect device activated screen
  await t.expect(deviceCodeActivatePageObject.isTerminalSuccessIconPresent()).eql(true);
  await t.expect(deviceCodeActivatePageObject.isBeaconTerminalPresent()).eql(false);
  await t.expect(deviceCodeActivatePageObject.isTryAgainButtonPresent()).eql(false);
  await t.expect(deviceCodeActivatePageObject.getFormTitle()).eql('Device activated');
  await t.expect(deviceCodeActivatePageObject.getPageSubtitle()).eql('Follow the instructions on your device for next steps');
});

test.requestHooks(legacyDeviceCodeConsentDeniedMockCodeActivate)('should be able to get device not activated screen when consent is denied on legacy SIW', async t => {
  const deviceCodeActivatePageObject = await setup(t);
  await rerenderWidget({
    stateToken: null, // render legacy sign in widget
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
  await deviceCodeActivatePageObject.setActivateCodeTextBoxValue('ABCD-WXYZ');
  await deviceCodeActivatePageObject.clickNextButton();

  await t.removeRequestHooks(legacyDeviceCodeConsentDeniedMockCodeActivate);
  await t.addRequestHooks(legacyDeviceCodeConsentDeniedMockTerminal);

  // identify with password
  await t.expect(deviceCodeActivatePageObject.signInFormUsernameFieldExists()).ok();
  await deviceCodeActivatePageObject.fillUserNameField('Test Identifier');
  await deviceCodeActivatePageObject.fillPasswordField('random password 123');
  await deviceCodeActivatePageObject.clickNextButton();

  // expect device not activated screen
  await t.expect(deviceCodeActivatePageObject.isTerminalErrorIconPresent()).eql(true);
  await t.expect(deviceCodeActivatePageObject.isBeaconTerminalPresent()).eql(false);
  await t.expect(deviceCodeActivatePageObject.isTryAgainButtonPresent()).eql(true);
  await t.expect(deviceCodeActivatePageObject.getFormTitle()).eql('Device not activated');
  await t.expect(deviceCodeActivatePageObject.getPageSubtitle()).contains('Your device cannot be activated because you did not allow access');
});

test.requestHooks(legacyDeviceCodeErrorMockCodeActivate)('should be able to get device not activated screen when there is an internal error on legacy SIW', async t => {
  const deviceCodeActivatePageObject = await setup(t);
  await rerenderWidget({
    stateToken: null, // render legacy sign in widget
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
  await deviceCodeActivatePageObject.setActivateCodeTextBoxValue('ABCD-WXYZ');
  await deviceCodeActivatePageObject.clickNextButton();

  await t.removeRequestHooks(legacyDeviceCodeErrorMockCodeActivate);
  await t.addRequestHooks(legacyDeviceCodeErrorMockTerminal);

  // identify with password
  await t.expect(deviceCodeActivatePageObject.signInFormUsernameFieldExists()).ok();
  await deviceCodeActivatePageObject.fillUserNameField('Test Identifier');
  await deviceCodeActivatePageObject.fillPasswordField('random password 123');
  await deviceCodeActivatePageObject.clickNextButton();

  // expect device not activated screen
  await t.expect(deviceCodeActivatePageObject.isTerminalErrorIconPresent()).eql(true);
  await t.expect(deviceCodeActivatePageObject.isBeaconTerminalPresent()).eql(false);
  await t.expect(deviceCodeActivatePageObject.isTryAgainButtonPresent()).eql(true);
  await t.expect(deviceCodeActivatePageObject.getFormTitle()).eql('Device not activated');
  await t.expect(deviceCodeActivatePageObject.getPageSubtitle()).contains('Your device cannot be activated because of an internal error');
});

test.requestHooks(legacyInvalidDeviceCodeMock)('should be able show error when wrong activation code is entered on legacy SIW', async t => {
  const deviceCodeActivatePageObject = await setup(t);
  await rerenderWidget({
    stateToken: null, // render legacy sign in widget
    authParams: {
      responseType: 'code',
    },
    useClassicEngine: true,
  });

  // login
  await deviceCodeActivatePageObject.form.setTextBoxValue('username', 'administrator@okta1.com');
  await deviceCodeActivatePageObject.form.setTextBoxValue('password', 'pass@word123');
  await deviceCodeActivatePageObject.form.clickSaveButton('Sign In');

  await t.expect(deviceCodeActivatePageObject.isActivateCodeTextBoxVisible()).eql(true);
  await deviceCodeActivatePageObject.setActivateCodeTextBoxValue('ABCD-WXYZ');
  await deviceCodeActivatePageObject.clickNextButton();
  await t.expect(deviceCodeActivatePageObject.form.hasErrorBox()).ok();
  await t.expect(deviceCodeActivatePageObject.getErrorBoxText()).contains('Invalid code. Try again.');
});

test.requestHooks(requestLogger, deviceCodeInvalidUserCodeMock)('should be able show error when wrong activation code is passed in the url on legacy SIW', async t => {
  requestLogger.clear();
  const deviceCodeActivatePageObject = new DeviceCodeActivatePageObject(t);
  // navigate to /activate?user_code=FAKE-CODE
  await deviceCodeActivatePageObject.navigateToPage({ 'user_code': 'FAKE-CODE' });
  await rerenderWidget({
    stateToken: null, // render legacy sign in widget
    authParams: {
      responseType: 'code',
    },
    useClassicEngine: true,
  });

  // login
  await deviceCodeActivatePageObject.form.setTextBoxValue('username', 'administrator@okta1.com');
  await deviceCodeActivatePageObject.form.setTextBoxValue('password', 'pass@word123');
  await deviceCodeActivatePageObject.form.clickSaveButton('Sign In');

  await t.expect(deviceCodeActivatePageObject.isActivateCodeTextBoxVisible()).eql(true);
  // expect error
  await t.expect(deviceCodeActivatePageObject.form.hasErrorBox()).ok();
  await t.expect(deviceCodeActivatePageObject.getErrorBoxText()).contains('Invalid code. Try again.');

  // enter correct code now
  await deviceCodeActivatePageObject.setActivateCodeTextBoxValue('ABCDWXYZ');
  await deviceCodeActivatePageObject.clickNextButton();
  // expect next screen
  await t.expect(deviceCodeActivatePageObject.isUserNameFieldVisible()).eql(true);
});

test.requestHooks(requestLogger, legacyDeviceCodeSuccessMockCodeActivate)('should be able to add hyphen automatically after 4th char in activation code input on legacy SIW', async t => {
  const deviceCodeActivatePageObject = await setup(t);
  await rerenderWidget({
    stateToken: null, // render legacy sign in widget
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
  await t.expect(await deviceCodeActivatePageObject.getActivationCodeTextBoxLabel()).eql('Activation Code');
  await t.expect(deviceCodeActivatePageObject.isActivateCodeTextBoxVisible()).eql(true);

  await deviceCodeActivatePageObject.setActivateCodeTextBoxValue('ABCDE');
  // expect hyphen after 4th character
  await t.expect(deviceCodeActivatePageObject.getActivateCodeTextBoxValue()).eql('ABCD-E');
});

test.requestHooks(requestLogger, legacyDeviceCodeSuccessWithUserCodeMockActivateCode)('should be able to complete device code activation flow on legacy SIW with user code pre-populated', async t => {
  const deviceCodeActivatePageObject = await setup(t);
  await rerenderWidget({
    stateToken: null, // render legacy sign in widget
    authParams: {
      responseType: 'code',
    },
    useClassicEngine: true,
  });

  // login
  await deviceCodeActivatePageObject.form.setTextBoxValue('username', 'administrator@okta1.com');
  await deviceCodeActivatePageObject.form.setTextBoxValue('password', 'pass@word123');
  await deviceCodeActivatePageObject.form.clickSaveButton('Sign In');

  await t.expect(deviceCodeActivatePageObject.isActivateCodeTextBoxVisible()).eql(true);
  await t.expect(deviceCodeActivatePageObject.getFormTitle()).eql('Activate your device');
  await t.expect(deviceCodeActivatePageObject.getPageSubtitle()).eql('Follow the instructions on your device to get an activation code');
  await t.expect(await deviceCodeActivatePageObject.getActivationCodeTextBoxLabel()).eql('Activation Code');
  

  await t.expect(requestLogger.contains(record => record.request.url.match(/api\/v1\/authn/))).eql(true);

  requestLogger.clear();

  // check if user code is prefilled in the input
  await t.expect(deviceCodeActivatePageObject.getActivateCodeTextBoxValue()).eql('ABCDXYWZ');

  // submit user code
  await deviceCodeActivatePageObject.clickNextButton();

  await t.expect(requestLogger.count(() => true)).eql(1);
  const req = requestLogger.requests[0].request;
  const reqBody = JSON.parse(req.body);
  await t.expect(reqBody).eql({
    userCode: 'ABCDXYWZ',
    stateToken: '00-dummy-state-token',
  });
  await t.expect(req.method).eql('post');
  await t.expect(req.url).eql('http://localhost:3000/api/v1/authn/device/activate');

  requestLogger.clear();

  await t.removeRequestHooks(legacyDeviceCodeSuccessWithUserCodeMockActivateCode);
  await t.addRequestHooks(legacyDeviceCodeSuccessWithUserCodeMockTerminal);

  // identify with password
  await t.expect(deviceCodeActivatePageObject.signInFormUsernameFieldExists()).ok();
  await deviceCodeActivatePageObject.fillUserNameField('Test Identifier');
  await deviceCodeActivatePageObject.fillPasswordField('random password 123');
  await deviceCodeActivatePageObject.clickNextButton();

  await t.expect(requestLogger.count(() => true)).eql(1);
  const reqIdentify = requestLogger.requests[0].request;
  await t.expect(reqIdentify.method).eql('post');
  await t.expect(reqIdentify.url).eql('http://localhost:3000/api/v1/authn');

  // expect device activated screen
  await t.expect(deviceCodeActivatePageObject.isTerminalSuccessIconPresent()).eql(true);
  await t.expect(deviceCodeActivatePageObject.isBeaconTerminalPresent()).eql(false);
  await t.expect(deviceCodeActivatePageObject.isTryAgainButtonPresent()).eql(false);
  await t.expect(deviceCodeActivatePageObject.getFormTitle()).eql('Device activated');
  await t.expect(deviceCodeActivatePageObject.getPageSubtitle()).eql('Follow the instructions on your device for next steps');
});