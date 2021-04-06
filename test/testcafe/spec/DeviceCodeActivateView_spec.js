import { RequestMock, RequestLogger } from 'testcafe';
import DeviceCodeActivatePageObject from '../framework/page-objects/DeviceCodeActivatePageObject';
import deviceCodeActivateResponse from '../../../playground/mocks/data/idp/idx/device-code-activate.json';
import idxActivateResponse from '../../../playground/mocks/data/idp/idx/identify-with-device-code.json';
import idxActivateErrorResponse from '../../../playground/mocks/data/idp/idx/error-invalid-device-code.json';
import idxDeviceActivatedTerminalResponse from '../../../playground/mocks/data/idp/idx/terminal-device-activated.json';

const deviceCodeSuccessMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(deviceCodeActivateResponse)
  .onRequestTo('http://localhost:3000/idp/idx/activate')
  .respond(idxActivateResponse)
  .onRequestTo('http://localhost:3000/idp/idx/identify')
  .respond(idxDeviceActivatedTerminalResponse);

const deviceCodeErrorMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(deviceCodeActivateResponse)
  .onRequestTo('http://localhost:3000/idp/idx/activate')
  .respond(idxActivateErrorResponse, 403);

const identifyRequestLogger = RequestLogger(
  /idx/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
  }
);

fixture('Device Code Activation Flow');

async function setup(t) {
  const deviceCodeActivatePage = new DeviceCodeActivatePageObject(t);
  await deviceCodeActivatePage.navigateToPage();
  return deviceCodeActivatePage;
}

test.requestHooks(identifyRequestLogger, deviceCodeSuccessMock)('should be able to complete device code activation flow', async t => {
  identifyRequestLogger.clear();
  const deviceCodeActivatePageObject = await setup(t);

  await t.expect(deviceCodeActivatePageObject.getPageTitle()).eql('Activate your device');
  await t.expect(deviceCodeActivatePageObject.getPageSubtitle()).eql('Follow the instructions on your device to get an activation code.');
  await t.expect(await deviceCodeActivatePageObject.getActivationCodeTextBoxLabel()).eql('Activation Code');
  await t.expect(deviceCodeActivatePageObject.isActivateCodeTextBoxVisible()).eql(true);

  // submit user code
  await deviceCodeActivatePageObject.setActivateCodeTextBoxValue('ABC-XYZ');
  await deviceCodeActivatePageObject.clickNextButton();

  await t.expect(identifyRequestLogger.count(() => true)).eql(2);
  const req = identifyRequestLogger.requests[1].request;
  const reqBody = JSON.parse(req.body);
  await t.expect(reqBody).eql({
    userCode: 'ABC-XYZ',
    stateHandle: '02itnqG312DoS3cU0z0LWs11l76yQ8ll4d95Oye61u',
  });
  await t.expect(req.method).eql('post');
  await t.expect(req.url).eql('http://localhost:3000/idp/idx/activate');

  identifyRequestLogger.clear();

  // identify with password
  await deviceCodeActivatePageObject.fillIdentifierField('Test Identifier');
  await deviceCodeActivatePageObject.fillPasswordField('random password 123');
  await deviceCodeActivatePageObject.clickNextButton();

  await t.expect(identifyRequestLogger.count(() => true)).eql(1);
  const reqIdentify = identifyRequestLogger.requests[0].request;
  const reqBodyIdentify = JSON.parse(reqIdentify.body);
  await t.expect(reqBodyIdentify).eql({
    identifier: 'Test Identifier',
    credentials: {
      passcode: 'random password 123',
    },
    stateHandle: '02itnqG312DoS3cU0z0LWs11l76yQ8ll4d95Oye61u',
  });
  await t.expect(reqIdentify.method).eql('post');
  await t.expect(reqIdentify.url).eql('http://localhost:3000/idp/idx/identify');

  // expect device activated screen
  await t.expect(deviceCodeActivatePageObject.getPageTitle()).eql('Device activated');
  await t.expect(deviceCodeActivatePageObject.getTerminalContent()).eql('Follow the instructions on your device for next steps.');
});

test.requestHooks(deviceCodeErrorMock)('should be able show error when wrong activation code is entered', async t => {
  identifyRequestLogger.clear();
  const deviceCodeActivatePageObject = await setup(t);
  await t.expect(deviceCodeActivatePageObject.isActivateCodeTextBoxVisible()).eql(true);

  await deviceCodeActivatePageObject.setActivateCodeTextBoxValue('ABC-XYZ');
  await deviceCodeActivatePageObject.clickNextButton();

  await t.expect(deviceCodeActivatePageObject.getGlobalErrors()).contains('Invalid code. Try again.');
});