import { RequestMock } from 'testcafe';
import FactorEnrollPasswordPageObject from '../framework/page-objects/FactorEnrollPasswordPageObject';
import SuccessPageObject from '../framework/page-objects/SuccessPageObject';
import xhrFactorEnrollPassword from '../../../playground/mocks/idp/idx/data/factor-enroll-password';
import xhrSuccess from '../../../playground/mocks/idp/idx/data/success';

const mock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrFactorEnrollPassword)
  .onRequestTo('http://localhost:3000/idp/idx')
  .respond(xhrSuccess);

fixture(`Factor Enroll Password`)
  .requestHooks(mock);

async function setup(t) {
  const enrollPasswordPage = new FactorEnrollPasswordPageObject(t);
  await enrollPasswordPage.navigateToPage();
  return enrollPasswordPage;
}

test(`should have both password and confirmPassword fields and both are required`, async t => {
  const enrollPasswordPage = await setup(t);

  // Check title 
  await t.expect(enrollPasswordPage.getFormTitle()).eql('Select a password');

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
});

test(`should succeed when fill same value`, async t => {
  const enrollPasswordPage = await setup(t);
  const successPage = new SuccessPageObject(t);

  await enrollPasswordPage.fillPassword('abcdabcd');
  await enrollPasswordPage.fillConfirmPassword('abcdabcd');
  await enrollPasswordPage.clickNextButton();

  const pageUrl = await successPage.getPageUrl();
  await t.expect(pageUrl)
    .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
});
