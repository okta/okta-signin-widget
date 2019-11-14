import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import ChallengeFactorPageObject from '../framework/page-objects/ChallengeFactorPageObject';
import { RequestMock } from 'testcafe';
import magicLinkReturnTab from '../../../playground/mocks/idp/idx/data/terminal-return-email';
import magicLinkExpired from '../../../playground/mocks/idp/idx/data/terminal-return-expired-email';

const magicLinkReturnTabMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx')
  .respond(magicLinkReturnTab)

const magicLinkExpiredMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx')
  .respond(magicLinkExpired)
  
fixture(`Challenge Email Magic Link Form Content`)

async function setup(t) {
  const identityPage = new IdentityPageObject(t);
  await identityPage.navigateToPage();
  await identityPage.fillIdentifierField('Challenge Email');
  await identityPage.clickNextButton();
  return new ChallengeFactorPageObject(t);
}

test
  .requestHooks(magicLinkReturnTabMock)
  (`challenge email factor with magic link`, async t => {
    const challengeFactorPageObject = await setup(t);
    const pageSubTitle = challengeFactorPageObject.getPageSubTitle('.okta-form-subtitle');
    await t.expect(pageSubTitle).eql('To finish signing in, return to the screen where you requested the email link.');
  });

test
  .requestHooks(magicLinkExpiredMock)
  (`challenge email factor with expired magic link`, async t => {
    const challengeFactorPageObject = await setup(t);
    const pageTitle = challengeFactorPageObject.getPageTitle();
    await t.expect(pageTitle).eql('This email link has expired. To resend it, return to the screen where you requested it.');
  });

