import ChallengeFactorPageObject from '../framework/page-objects/ChallengeFactorPageObject';
import { RequestMock, RequestLogger } from 'testcafe';
import magicLinkReturnTab from '../../../playground/mocks/idp/idx/data/terminal-return-email';
import magicLinkExpired from '../../../playground/mocks/idp/idx/data/terminal-return-expired-email';
import magicLinkEmailSent from '../../../playground/mocks/idp/idx/data/factor-verification-email';
import TerminalPageObject from '../framework/page-objects/TerminalPageObject';

const magicLinkReturnTabMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(magicLinkReturnTab);

const magicLinkExpiredMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(magicLinkExpired);

const magicLinkEmailSentMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(magicLinkEmailSent)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/resend')
  .respond(magicLinkEmailSent)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(magicLinkEmailSent)
;

const logger = RequestLogger(/poll|resend/);

fixture(`Challenge Email Magic Link Form Content`);

async function setup(t) {
  const challengeFactorPageObject = new ChallengeFactorPageObject(t);
  challengeFactorPageObject.navigateToPage();
  return challengeFactorPageObject;
}

test
  .requestHooks(magicLinkReturnTabMock)(`challenge email factor with magic link`, async t => {
    await setup(t);
    const terminalPageObject = await new TerminalPageObject(t);
    await t.expect(terminalPageObject.getFormTitle()).eql('Verify with Email Authentication');
    await t.expect(terminalPageObject.getFormSubtitle()).eql('To finish signing in, return to the screen where you requested the email link.');
  });

test
  .requestHooks(magicLinkExpiredMock)(`challenge email factor with expired magic link`, async t => {
    const challengeFactorPageObject = await setup(t);
    const pageTitle = challengeFactorPageObject.getPageTitle();
    await t.expect(pageTitle).eql('This email link has expired. To resend it, return to the screen where you requested it.');
  });

test
  .requestHooks(logger, magicLinkEmailSentMock)(`challenge email factor with magic link sent renders and has resend link`, async t => {
    const challengeFactorPageObject = await setup(t);
    await t.expect(challengeFactorPageObject.resendEmailView().getStyleProperty('display')).eql('none');
    // wait for resend button to appear
    await t.wait(65000);
    // Making sure we keep polling while we wait for the resend view to appear
    // Widget will poll with a refresh interval of 4000(comes from API).
    // In 65000 seconds it will poll Math.floor(65000/4000) = 16 times
    await t.expect(logger.count(
      record => record.response.statusCode === 200 &&
      record.request.url.match(/poll/)
    )).eql(16);
    await t.expect(challengeFactorPageObject.resendEmailView().getStyleProperty('display')).eql('block');
    const resendEmailView = challengeFactorPageObject.resendEmailView();
    await t.expect(resendEmailView.innerText).eql('Haven\'t received an email? Send again');
    await challengeFactorPageObject.clickSendAgainLink();
    await t.expect(logger.count(
      record => record.response.statusCode === 200 &&
      record.request.url.match(/poll|resend/)
    )).eql(17);
  });
