import { RequestMock } from 'testcafe';
import EnrollOnPremPageObject from '../framework/page-objects/EnrollOnPremPageObject';
import SuccessPageObject from '../framework/page-objects/SuccessPageObject';
import { checkConsoleMessages } from '../framework/shared';
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
  await checkConsoleMessages({
    controller: 'enroll-onprem',
    formName: 'enroll-authenticator',
    authenticatorKey: 'onprem_mfa',
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

    // Verify links (switch authenticator link is present even if there is just one authenticator available)
    await t.expect(await enrollOnPremPage.switchAuthenticatorLinkExists()).ok();
    await t.expect(await enrollOnPremPage.signoutLinkExists()).ok();

    // fields are required
    await enrollOnPremPage.fillUserName('');
    await enrollOnPremPage.clickNextButton();
    await enrollOnPremPage.waitForErrorBox();
    await t.expect(enrollOnPremPage.getPasscodeError()).eql('This field cannot be left blank');
    await t.expect(enrollOnPremPage.getUserNameError()).eql('This field cannot be left blank');

    await t.expect(await enrollOnPremPage.signoutLinkExists()).ok();
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
      .contains('Pin accepted, Wait for token to change, then enter new passcode.');
    await t.expect(enrollOnPremPage.getPasscodeValue()).eql('');
  });
