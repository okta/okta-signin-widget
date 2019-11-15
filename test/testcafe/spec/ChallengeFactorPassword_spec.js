import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import ChallengeFactorPageObject from '../framework/page-objects/ChallengeFactorPageObject';
import { ClientFunction, RequestMock } from 'testcafe';
import factorRequiredPassword from '../../../playground/mocks/idp/idx/data/factor-verification-password';
import success from '../../../playground/mocks/idp/idx/data/success';

const mock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx')
  .respond(factorRequiredPassword)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(success)

fixture(`Challenge Password Form`)
  .requestHooks(mock)

async function setup(t) {
  const identityPage = new IdentityPageObject(t);
  await identityPage.navigateToPage();
  await identityPage.fillIdentifierField('Challenge Password');
  await identityPage.clickNextButton();
  return new ChallengeFactorPageObject(t);
}
const getPageUrl = ClientFunction(() => window.location.href);
test
  (`challenge password factor`, async t => {
    const challengeFactorPageObject = await setup(t);
    await challengeFactorPageObject.verifyFactor('credentials.passcode', 'test');
    await challengeFactorPageObject.clickNextButton();
    const pageUrl = getPageUrl();
    await t.expect(pageUrl).contains('stateToken=abc123');
  });
