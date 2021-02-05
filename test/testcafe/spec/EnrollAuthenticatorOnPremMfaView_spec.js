import { RequestMock } from 'testcafe';
import EnrollOnPremPageObject from '../framework/page-objects/EnrollOnPremPageObject';
import SuccessPageObject from '../framework/page-objects/SuccessPageObject';
import xhrAuthenticatorEnrollOnPrem from '../../../playground/mocks/data/idp/idx/authenticator-enroll-on-prem';
import xhrSuccess from '../../../playground/mocks/data/idp/idx/success';
import xhrPasscodeChange from '../../../playground/mocks/data/idp/idx/error-authenticator-enroll-passcode-change-on-prem';

const successMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollOnPrem)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(xhrSuccess);

const passcodeChangeMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollOnPrem)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(xhrPasscodeChange, 403);

fixture('Authenticator On Prem');

async function setup(t) {
  const enrollOnPremPage = new EnrollOnPremPageObject(t);
  await enrollOnPremPage.navigateToPage();

  const { log } = await t.getBrowserConsoleMessages();
  await t.expect(log.length).eql(3);
  await t.expect(log[0]).eql('===== playground widget ready event received =====');
  await t.expect(log[1]).eql('===== playground widget afterRender event received =====');
  await t.expect(JSON.parse(log[2])).eql({
    controller: 'enroll-webauthn', // We need to change ViewClassNamesFactory to use authenticatorKey
    formName: 'enroll-authenticator',
    authenticatorKey: 'del_oath',
    methodType: 'otp'
  });

  return enrollOnPremPage;
}

test
  .requestHooks(successMock)('should have both username and passcode fields and both are required', async t => {
    const enrollOnPremPage = await setup(t);

    // Check title
    await t.expect(enrollOnPremPage.getFormTitle()).eql('Set up Atko Custom On-prem');
    await t.expect(enrollOnPremPage.getSaveButtonLabel()).eql('Verify');
    await t.expect(enrollOnPremPage.userNameFieldExists()).eql(true);
    await t.expect(enrollOnPremPage.passcodeFieldExists()).eql(true);

    // assert switch authenticator link shows up
    await t.expect(await enrollOnPremPage.switchAuthenticatorLinkExists()).ok();
    await t.expect(enrollOnPremPage.getSwitchAuthenticatorLinkText()).eql('Return to authenticator list');

    // fields are required
    await enrollOnPremPage.fillUserName('');
    await enrollOnPremPage.clickNextButton();
    await enrollOnPremPage.waitForErrorBox();
    await t.expect(enrollOnPremPage.getPasscodeError()).eql('This field cannot be left blank');
    await t.expect(enrollOnPremPage.getUserNameError()).eql('This field cannot be left blank');

    await t.expect(await enrollOnPremPage.signoutLinkExists()).notOk();
  });

test
  .requestHooks(successMock)('should succeed when values are set', async t => {
    const enrollOnPremPage = await setup(t);
    const successPage = new SuccessPageObject(t);

    await enrollOnPremPage.fillUserName('abcdabcd');
    await enrollOnPremPage.fillPasscode('abcdabcd');
    await enrollOnPremPage.clickNextButton();

    const pageUrl = await successPage.getPageUrl();
    await t.expect(pageUrl)
      .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
  });

test
  .requestHooks(passcodeChangeMock)('displays error and clears passcode when passcode change response', async t => {
    const enrollOnPremPage = await setup(t);

    await enrollOnPremPage.fillUserName('abcdabcd');
    await enrollOnPremPage.fillPasscode('abcdabcd');
    await enrollOnPremPage.clickNextButton();

    await enrollOnPremPage.waitForErrorBox();
    const errorBox = enrollOnPremPage.getErrorBox();
    await t.expect(errorBox.innerText)
      .contains('Wait for token to change, then enter the new tokencode.');
    await t.expect(enrollOnPremPage.getPasscodeValue()).eql('');
  });
