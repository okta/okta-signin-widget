import { RequestMock } from 'testcafe';
import FactorEnrollPasswordPageObject from '../framework/page-objects/FactorEnrollPasswordPageObject';
import SuccessPageObject from '../framework/page-objects/SuccessPageObject';
import xhrAuthenticatorEnrollPassword from '../../../playground/mocks/data/idp/idx/authenticator-enroll-password';
import xhrSuccess from '../../../playground/mocks/data/idp/idx/success';

const mock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorEnrollPassword)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(xhrSuccess);

fixture('Authenticator Enroll Password')
  .requestHooks(mock);

async function setup(t) {
  const enrollPasswordPage = new FactorEnrollPasswordPageObject(t);
  await enrollPasswordPage.navigateToPage();

  const { log } = await t.getBrowserConsoleMessages();
  await t.expect(log.length).eql(3);
  await t.expect(log[0]).eql('===== playground widget ready event received =====');
  await t.expect(log[1]).eql('===== playground widget afterRender event received =====');
  await t.expect(JSON.parse(log[2])).eql({
    controller: 'enroll-password',
    formName: 'enroll-authenticator',
    authenticatorType: 'password',
  });

  return enrollPasswordPage;
}

test('should have both password and confirmPassword fields and both are required', async t => {
  const enrollPasswordPage = await setup(t);

  // Check title
  await t.expect(enrollPasswordPage.getFormTitle()).eql('Set up password');
  await t.expect(enrollPasswordPage.getSaveButtonLabel()).eql('Next');
  await t.expect(enrollPasswordPage.passwordFieldExists()).eql(true);
  await t.expect(enrollPasswordPage.confirmPasswordFieldExists()).eql(true);

  // assert switch authenticator link shows up
  await t.expect(await enrollPasswordPage.switchAuthenticatorLinkExists()).ok();
  await t.expect(enrollPasswordPage.getSwitchAuthenticatorLinkText()).eql('Return to authenticator list');

  // fields are required
  await enrollPasswordPage.clickNextButton();
  await enrollPasswordPage.waitForErrorBox();
  await t.expect(enrollPasswordPage.getPasswordError()).eql('This field cannot be left blank');
  await t.expect(enrollPasswordPage.getConfirmPasswordError()).eql('This field cannot be left blank');

  // password must match
  await enrollPasswordPage.fillPassword('abcd');
  await enrollPasswordPage.fillConfirmPassword('1234');
  await enrollPasswordPage.clickNextButton();
  await enrollPasswordPage.waitForErrorBox();
  await t.expect(enrollPasswordPage.hasPasswordError()).eql(false);
  await t.expect(enrollPasswordPage.getConfirmPasswordError()).eql('New passwords must match');

  await t.expect(await enrollPasswordPage.signoutLinkExists()).notOk();
});

test('should succeed when fill same value', async t => {
  const enrollPasswordPage = await setup(t);
  const successPage = new SuccessPageObject(t);

  await enrollPasswordPage.fillPassword('abcdabcd');
  await enrollPasswordPage.fillConfirmPassword('abcdabcd');
  await enrollPasswordPage.clickNextButton();

  const pageUrl = await successPage.getPageUrl();
  await t.expect(pageUrl)
    .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
});

test('should have the correct reqiurements', async t => {
  const enrollPasswordPage = await setup(t);
  await t.expect(enrollPasswordPage.getRequirements()).contains('Password requirements:');
  await t.expect(enrollPasswordPage.getRequirements()).contains('At least 8 characters');
  await t.expect(enrollPasswordPage.getRequirements()).contains('An uppercase letter');
  await t.expect(enrollPasswordPage.getRequirements()).contains('A number');
  await t.expect(enrollPasswordPage.getRequirements()).contains('A symbol');
  await t.expect(enrollPasswordPage.getRequirements()).contains('Does not include your first name');
  await t.expect(enrollPasswordPage.getRequirements()).contains('Does not include your last name');
  await t.expect(enrollPasswordPage.getRequirements()).contains('At least 2 hour(s) must have elapsed since you last changed your password');
  await t.expect(enrollPasswordPage.getRequirements()).contains('No parts of your username');
  await t.expect(enrollPasswordPage.getRequirements()).contains('Your password cannot be any of your last 4 passwords');
  await t.expect(enrollPasswordPage.getRequirements()).contains('A lowercase letter');
});
