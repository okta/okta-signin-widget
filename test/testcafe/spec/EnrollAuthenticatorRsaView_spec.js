import { RequestMock } from 'testcafe';
import EnrollRsaPageObject from '../framework/page-objects/EnrollOnPremPageObject';
import SuccessPageObject from '../framework/page-objects/SuccessPageObject';
import { checkConsoleMessages } from '../framework/shared';
import xhrAuthenticatorEnrollRsa from '../../../playground/mocks/data/idp/idx/authenticator-enroll-rsa';
import xhrSuccess from '../../../playground/mocks/data/idp/idx/success';
import xhrPasscodeChange from '../../../playground/mocks/data/idp/idx/error-authenticator-enroll-passcode-change-rsa';

const successMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollRsa)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(xhrSuccess);

const passcodeChangeMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollRsa)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(xhrPasscodeChange, 403);

fixture('Authenticator RSA');

async function setup(t) {
  const enrollRsaPage = new EnrollRsaPageObject(t);
  await enrollRsaPage.navigateToPage();

  await checkConsoleMessages({
    controller: 'enroll-rsa',
    formName: 'enroll-authenticator',
    authenticatorKey: 'rsa_token',
    methodType: 'otp'
  });

  return enrollRsaPage;
}

test
  .requestHooks(successMock)('should have both username and passcode fields and both are required', async t => {
    const enrollRsaPage = await setup(t);

    // Check title
    await t.expect(enrollRsaPage.getFormTitle()).eql('Set up RSA SecurID');
    await t.expect(enrollRsaPage.getSaveButtonLabel()).eql('Verify');
    await t.expect(enrollRsaPage.userNameFieldExists()).eql(true);
    await t.expect(enrollRsaPage.passcodeFieldExists()).eql(true);

    // Verify links (switch authenticator link not present since there are no other authenticators available)
    await t.expect(await enrollRsaPage.switchAuthenticatorLinkExists()).notOk();
    await t.expect(await enrollRsaPage.signoutLinkExists()).ok();

    // fields are required
    await enrollRsaPage.fillUserName('');
    await enrollRsaPage.clickNextButton();
    await enrollRsaPage.waitForErrorBox();
    await t.expect(enrollRsaPage.getPasscodeError()).eql('This field cannot be left blank');
    await t.expect(enrollRsaPage.getUserNameError()).eql('This field cannot be left blank');

    // Verify links (switch authenticator link not present since there are no other authenticators available)
    await t.expect(await enrollRsaPage.switchAuthenticatorLinkExists()).notOk();
    await t.expect(await enrollRsaPage.signoutLinkExists()).ok();
  });

test
  .requestHooks(successMock)('should succeed when values are set', async t => {
    const enrollRsaPage = await setup(t);
    const successPage = new SuccessPageObject(t);

    await enrollRsaPage.fillUserName('abcdabcd');
    await enrollRsaPage.fillPasscode('abcdabcd');
    await enrollRsaPage.clickNextButton();

    const pageUrl = await successPage.getPageUrl();
    await t.expect(pageUrl)
      .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
  });

test
  .requestHooks(passcodeChangeMock)('displays error and clears passcode when passcode change response', async t => {
    const enrollRsaPage = await setup(t);

    await enrollRsaPage.fillUserName('abcdabcd');
    await enrollRsaPage.fillPasscode('abcdabcd');
    await enrollRsaPage.clickNextButton();

    await enrollRsaPage.waitForErrorBox();
    const errorBox = enrollRsaPage.getErrorBox();
    await t.expect(errorBox.innerText)
      .contains('Pin accepted, Wait for token to change, then enter new passcode.');
    await t.expect(enrollRsaPage.getPasscodeValue()).eql('');
  });
