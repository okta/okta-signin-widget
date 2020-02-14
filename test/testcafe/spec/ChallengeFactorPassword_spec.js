import SuccessPageObject from '../framework/page-objects/SuccessPageObject';
import ChallengeFactorPageObject from '../framework/page-objects/ChallengeFactorPageObject';
import { RequestMock } from 'testcafe';
import factorRequiredPassword from '../../../playground/mocks/idp/idx/data/factor-verification-password';
import success from '../../../playground/mocks/idp/idx/data/success';

const mock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(factorRequiredPassword)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(success);

fixture(`Challenge Password Form`)
  .requestHooks(mock);

async function setup(t) {
  const challengeFactorPage = new ChallengeFactorPageObject(t);
  await challengeFactorPage.navigateToPage();
  return challengeFactorPage;
}
test(`challenge password factor`, async t => {
  const challengeFactorPageObject = await setup(t);
  await challengeFactorPageObject.verifyFactor('credentials.passcode', 'test');
  await challengeFactorPageObject.clickNextButton();
  const successPage = new SuccessPageObject(t);
  const pageUrl = await successPage.getPageUrl();
  await t.expect(pageUrl)
    .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
});
