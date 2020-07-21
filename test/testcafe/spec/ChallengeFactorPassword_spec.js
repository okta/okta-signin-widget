import SuccessPageObject from '../framework/page-objects/SuccessPageObject';
import ChallengePasswordPageObject from '../framework/page-objects/ChallengePasswordPageObject';
import { RequestMock } from 'testcafe';
import factorRequiredPassword from '../../../playground/mocks/data/idp/idx/factor-verification-password';
import success from '../../../playground/mocks/data/idp/idx/success';

const factorRequiredPasswordMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(factorRequiredPassword)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(success);

fixture(`Challenge Factor Password`);

async function setup(t) {
  const challengePasswordPage = new ChallengePasswordPageObject(t);
  await challengePasswordPage.navigateToPage();
  return challengePasswordPage;
}
test.requestHooks(factorRequiredPasswordMock)(`challenge password factor`, async t => {
  const challengeFactorPageObject = await setup(t);
  await challengeFactorPageObject.switchFactorExists();
  await challengeFactorPageObject.forgotPasswordLink.exists();
  await challengeFactorPageObject.verifyFactor('credentials.passcode', 'test');
  await challengeFactorPageObject.clickNextButton();
  const successPage = new SuccessPageObject(t);
  const pageUrl = await successPage.getPageUrl();
  await t.expect(pageUrl)
    .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
});
