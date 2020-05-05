import SuccessPageObject from '../framework/page-objects/SuccessPageObject';
import ChallengeFactorPageObject from '../framework/page-objects/ChallengeFactorPageObject';
import { RequestMock } from 'testcafe';
import factorRequiredPassword from '../../../playground/mocks/idp/idx/data/factor-verification-password';
import authenticatorRequiredPassword from '../../../playground/mocks/idp/idx/data/authenticator-verification-password';
import success from '../../../playground/mocks/idp/idx/data/success';

const factorRequiredPasswordMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(factorRequiredPassword)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(success);

const authenticatorRequiredPasswordMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(authenticatorRequiredPassword)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(success);

fixture(`Challenge Password Form`);

async function setup(t) {
  const challengeFactorPage = new ChallengeFactorPageObject(t);
  await challengeFactorPage.navigateToPage();
  return challengeFactorPage;
}
test.requestHooks(factorRequiredPasswordMock)(`challenge password factor`, async t => {
  const challengeFactorPageObject = await setup(t);
  await challengeFactorPageObject.switchFactorExists();
  await challengeFactorPageObject.forgotPasswordExists();
  await challengeFactorPageObject.verifyFactor('credentials.passcode', 'test');
  await challengeFactorPageObject.clickNextButton();
  const successPage = new SuccessPageObject(t);
  const pageUrl = await successPage.getPageUrl();
  await t.expect(pageUrl)
    .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
});

test.requestHooks(authenticatorRequiredPasswordMock)(`challenge password authenticator`, async t => {
  const challengeFactorPageObject = await setup(t);
  await challengeFactorPageObject.verifyFactor('credentials.passcode', 'test');
  await challengeFactorPageObject.clickNextButton();
  const successPage = new SuccessPageObject(t);
  const pageUrl = await successPage.getPageUrl();
  await t.expect(pageUrl)
    .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
});