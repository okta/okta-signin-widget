import { RequestMock, RequestLogger } from 'testcafe';
import DeviceCodeActivatePageObject from '../framework/page-objects/DeviceCodeActivatePageObject';
import deviceCodeActivateResponse from '../../../playground/mocks/data/idp/idx/device-code-activate.json';
import deviceCodeActivateErrorResponse from '../../../playground/mocks/data/idp/idx/error-device-code-activate.json';
import idxActivateResponse from '../../../playground/mocks/data/idp/idx/identify-with-password.json';
import idxActivateErrorResponse from '../../../playground/mocks/data/idp/idx/error-invalid-device-code.json';
import idxDeviceActivatedTerminalResponse from '../../../playground/mocks/data/idp/idx/terminal-device-activated.json';
import idxDeviceNotActivatedConsentDeniedResponse from '../../../playground/mocks/data/idp/idx/terminal-device-not-activated-consent-denied.json';
import idxDeviceNotActivatedInternalErrorResponse from '../../../playground/mocks/data/idp/idx/terminal-device-not-activated-internal-error.json';
import { a11yCheck } from '../framework/shared';

const deviceCodeSuccessMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(deviceCodeActivateResponse)
  .onRequestTo('http://localhost:3000/idp/idx/device/activate')
  .respond(idxActivateResponse)
  .onRequestTo('http://localhost:3000/idp/idx/identify')
  .respond(idxDeviceActivatedTerminalResponse);

const deviceCodeConsentDeniedMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(deviceCodeActivateResponse)
  .onRequestTo('http://localhost:3000/idp/idx/device/activate')
  .respond(idxActivateResponse)
  .onRequestTo('http://localhost:3000/idp/idx/identify')
  .respond(idxDeviceNotActivatedConsentDeniedResponse);

const deviceCodeInternalErrorMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(deviceCodeActivateResponse)
  .onRequestTo('http://localhost:3000/idp/idx/device/activate')
  .respond(idxActivateResponse)
  .onRequestTo('http://localhost:3000/idp/idx/identify')
  .respond(idxDeviceNotActivatedInternalErrorResponse);

const invalidDeviceCodeMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(deviceCodeActivateResponse)
  .onRequestTo('http://localhost:3000/idp/idx/device/activate')
  .respond(idxActivateErrorResponse, 403);

const deviceCodeInvalidUserCodeMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(deviceCodeActivateErrorResponse)
  .onRequestTo('http://localhost:3000/idp/idx/device/activate')
  .respond(idxActivateResponse)
  .onRequestTo('http://localhost:3000/idp/idx/identify')
  .respond(idxDeviceActivatedTerminalResponse);

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
  await a11yCheck(t);
  return deviceCodeActivatePage;
}

test.requestHooks(identifyRequestLogger, deviceCodeSuccessMock)('should be able to complete device code activation flow', async t => {
  identifyRequestLogger.clear();
  const deviceCodeActivatePageObject = await setup(t);

  await t.expect(deviceCodeActivatePageObject.getPageTitle()).eql('Activate your device');
  await t.expect(deviceCodeActivatePageObject.getPageSubtitle()).eql('Follow the instructions on your device to get an activation code');
  await t.expect(await deviceCodeActivatePageObject.getActivationCodeTextBoxLabel()).eql('Activation Code');
  await t.expect(deviceCodeActivatePageObject.isActivateCodeTextBoxVisible()).eql(true);

  // submit user code
  await deviceCodeActivatePageObject.setActivateCodeTextBoxValue('ABCDWXYZ');
  await deviceCodeActivatePageObject.clickNextButton();

  await t.expect(identifyRequestLogger.count(() => true)).eql(2);
  const req = identifyRequestLogger.requests[1].request;
  const reqBody = JSON.parse(req.body);
  await t.expect(reqBody).eql({
    userCode: 'ABCD-WXYZ',
    stateHandle: '02itnqG312DoS3cU0z0LWs11l76yQ8ll4d95Oye61u',
  });
  await t.expect(req.method).eql('post');
  await t.expect(req.url).eql('http://localhost:3000/idp/idx/device/activate');

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
    stateHandle: 'eyJ6aXAiOiJERUYiLCJhbGlhcyI6ImVuY3J5cHRpb25rZXkiLCJ2ZXIiOiIxIiwib2lkIjoiMDBvczI0VHZiWHlqOVFLSm4wZzMiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiZGlyIn0..4z7WWUdd0LzIJLxz.GmOyeMJ5XtS7kZipFanQxaMd2rblpEeaWv8U5IfaJv5F2V1otwft4q1tVo3yqbedhBjN-nO5qk6qR-0Op34lmecwwmHeRyzYbhrFiLZaR88nhCFMblP8Bo5d3Opl5gkX02e0FQL-Osorxvml0XYbuO7GdTH5EkIv0Q7h0Dq7L__h_uFLies8AkJZWIDQh25RlqcEjToHCvVW31A_NJJ1Vf5c8GFuyb9LsJ9kUpZikpK6C72GPrU_LGrIW8VBT4l24dDEre4J8XvTNO7fdVDiq-H7BEeIjaY06q1zqlVLWwqOHoKpGNQ0NMhBIXB0ZZC57Me9pFI5GLIUwRDUIm1vw3t_mHJDVIcCJe9kmt29tTccZ8Zo0N3q5bSiwMoNHPLxZSOrbx-bf4fniorNH5ypJnke7pc2Q3DFmqfPrB7CE1REjAyCKBHYDAfVexYCkMfCl0E8oMFJinnLbynb7Bqvbp_DqL8h0pNIoXUF4KTTsuKQg8yCCqBhkajxlvh9G7L3Sf76o4B2itB7ldeqXzAE9H60yqhIKEZPNOHUgRC2SkWkWlH6NIaNWQ2Bi2CjnL9YvUuQmO-dpf08KeCgwfVmT4GBTGfTkXwy3pBitacCqEREen2j2iUH9mhi2LOOFaGLh0TXslcBgkGuht6P7gyH2JN6yFInQyIp33xQsqYg7nqOZG1LCrQSqoviTfI72-AC6b7tju8YEn1P0nXGbSzlCztSXl2pa95tr4L5pyX8fNydKYMTLeHEnmNtXlRB6wQYP1ljf4Tzgus7O0etyJs75znsXHZ42znxlEKGhTo3ucFe3CI-vsHF1FDDj2DVeWl21zVOTehTbBaemoD1ekD5F8OHS7SrK9Bw7PTa-lpyls1OxvE_Wsco4_eGbax_DoPm6DbCwj8hWzb5wLEs6TClZKoUJeV1MSVB3OgGBZ3AGzhwfeG0sGi5DnUpAeKqgP6IN8kziNRDmW3YE0qIY2mLs7nI438RTu__6bg1E6SH1QHMNucNbmoDR6VDIUmlYc0xEpygH6PBVqiPD64MnD73_D9IinVNzqW7KQzAvuFFQW_LGDfjuh1D-oTs1gi1wWDylibjxdJabveoJ10NHgeb6SaYHg.kf5iTnjNKsKqhz0iE5K_Yw',
  });
  await t.expect(reqIdentify.method).eql('post');
  await t.expect(reqIdentify.url).eql('http://localhost:3000/idp/idx/identify');

  // expect device activated screen
  await t.expect(deviceCodeActivatePageObject.getPageTitle()).eql('Device activated');
  await t.expect(deviceCodeActivatePageObject.getTerminalContent()).eql('Follow the instructions on your device for next steps');
  await t.expect(deviceCodeActivatePageObject.isTerminalSuccessIconPresent()).eql(true);
  await t.expect(deviceCodeActivatePageObject.isBeaconTerminalPresent()).eql(false);
  await t.expect(deviceCodeActivatePageObject.isTryAgainButtonPresent()).eql(false);
});

test.requestHooks(deviceCodeConsentDeniedMock)('should be able to get device not activated screen when consent is denied', async t => {
  const deviceCodeActivatePageObject = await setup(t);

  // submit user code
  await deviceCodeActivatePageObject.setActivateCodeTextBoxValue('ABCD-WXYZ');
  await deviceCodeActivatePageObject.clickNextButton();

  // identify with password
  await deviceCodeActivatePageObject.fillIdentifierField('Test Identifier');
  await deviceCodeActivatePageObject.fillPasswordField('random password 123');
  await a11yCheck(t);
  await deviceCodeActivatePageObject.clickNextButton();

  // expect device not activated screen
  await t.expect(deviceCodeActivatePageObject.getPageTitle()).eql('Device not activated');
  await t.expect(deviceCodeActivatePageObject.getTerminalContent()).contains('Your device cannot be activated because you did not allow access');
  await t.expect(deviceCodeActivatePageObject.isTerminalErrorIconPresent()).eql(true);
  await t.expect(deviceCodeActivatePageObject.isBeaconTerminalPresent()).eql(false);
  await t.expect(deviceCodeActivatePageObject.isTryAgainButtonPresent()).eql(true);
  await a11yCheck(t);
});

test.requestHooks(deviceCodeInternalErrorMock)('should be able to get device not activated screen when there is an internal error', async t => {
  const deviceCodeActivatePageObject = await setup(t);

  // submit user code
  await deviceCodeActivatePageObject.setActivateCodeTextBoxValue('ABCD-WXYZ');
  await deviceCodeActivatePageObject.clickNextButton();

  // identify with password
  await deviceCodeActivatePageObject.fillIdentifierField('Test Identifier');
  await deviceCodeActivatePageObject.fillPasswordField('random password 123');
  await deviceCodeActivatePageObject.clickNextButton();

  // expect device not activated screen
  await t.expect(deviceCodeActivatePageObject.getPageTitle()).eql('Device not activated');
  await t.expect(deviceCodeActivatePageObject.getTerminalContent()).contains('Your device cannot be activated because of an internal error');
  await t.expect(deviceCodeActivatePageObject.isTerminalErrorIconPresent()).eql(true);
  await t.expect(deviceCodeActivatePageObject.isBeaconTerminalPresent()).eql(false);
  await t.expect(deviceCodeActivatePageObject.isTryAgainButtonPresent()).eql(true);
});

test.requestHooks(invalidDeviceCodeMock)('should be able show error when wrong activation code is entered', async t => {
  identifyRequestLogger.clear();
  const deviceCodeActivatePageObject = await setup(t);
  await t.expect(deviceCodeActivatePageObject.isActivateCodeTextBoxVisible()).eql(true);

  await deviceCodeActivatePageObject.setActivateCodeTextBoxValue('ABCD-WXYZ');
  await deviceCodeActivatePageObject.clickNextButton();

  await t.expect(deviceCodeActivatePageObject.getGlobalErrors()).contains('Invalid code. Try again.');
  await a11yCheck(t);
});

test.requestHooks(identifyRequestLogger, deviceCodeInvalidUserCodeMock)('should be able show error when wrong activation code is passed in the url', async t => {
  identifyRequestLogger.clear();
  const deviceCodeActivatePageObject = new DeviceCodeActivatePageObject(t);
  // navigate to /activate?user_code=FAKE-CODE
  await deviceCodeActivatePageObject.navigateToPage({ 'user_code': 'FAKE-CODE' });
  await t.expect(deviceCodeActivatePageObject.isActivateCodeTextBoxVisible()).eql(true);
  // expect error
  await t.expect(deviceCodeActivatePageObject.getGlobalErrors()).contains('Invalid code. Try again.');

  // enter correct code now
  await deviceCodeActivatePageObject.setActivateCodeTextBoxValue('ABCDWXYZ');
  await deviceCodeActivatePageObject.clickNextButton();
  // expect next screen
  await t.expect(deviceCodeActivatePageObject.isIdentifierFieldVisible()).eql(true);
});

test.requestHooks(identifyRequestLogger, deviceCodeSuccessMock)('should be able to add hyphen automatically after 4th char in activation code input', async t => {
  identifyRequestLogger.clear();
  const deviceCodeActivatePageObject = await setup(t);

  await t.expect(await deviceCodeActivatePageObject.getActivationCodeTextBoxLabel()).eql('Activation Code');
  await t.expect(deviceCodeActivatePageObject.isActivateCodeTextBoxVisible()).eql(true);

  await deviceCodeActivatePageObject.setActivateCodeTextBoxValue('ABCDE');
  // expect hyphen after 4th character
  await t.expect(deviceCodeActivatePageObject.getActivateCodeTextBoxValue()).eql('ABCD-E');
});