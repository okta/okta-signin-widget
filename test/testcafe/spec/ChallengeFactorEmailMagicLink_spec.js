import ChallengeFactorPageObject from '../framework/page-objects/ChallengeFactorPageObject';
import { RequestMock, RequestLogger } from 'testcafe';
import TerminalPageObject from '../framework/page-objects/TerminalPageObject';

import magicLinkEmailSent from '../../../playground/mocks/data/idp/idx/factor-verification-email';
import magicLinkReturnTab from '../../../playground/mocks/data/idp/idx/terminal-return-email';
import magicLinkExpired from '../../../playground/mocks/data/idp/idx/terminal-return-expired-email';
import terminalTransferedEmail from '../../../playground/mocks/data/idp/idx/terminal-transfered-email';

const magicLinkReturnTabMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(magicLinkReturnTab);

const magicLinkExpiredMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(magicLinkExpired);

const magicLinkTransfer = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(terminalTransferedEmail);

const magicLinkEmailSentMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(magicLinkEmailSent)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/resend')
  .respond(magicLinkEmailSent)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(magicLinkEmailSent)
;

const logger = RequestLogger(/poll|resend/);

fixture('Challenge Email Magic Link Form Content');

async function setup(t) {
  const challengeFactorPageObject = new ChallengeFactorPageObject(t);
  challengeFactorPageObject.navigateToPage();
  return challengeFactorPageObject;
}

test
  .requestHooks(magicLinkReturnTabMock)('challenge email factor with magic link', async t => {
    await setup(t);
    const terminalPageObject = await new TerminalPageObject(t);
    await t.expect(terminalPageObject.getMessages()).eql('Please return to the original tab.');
  });

test
  .requestHooks(magicLinkTransfer)('show the correct content when transferred email', async t => {
    await setup(t);
    const terminalPageObject = await new TerminalPageObject(t);
    await t.expect(terminalPageObject.getMessages()).eql('Flow continued in a new tab.');
  });

test
  .requestHooks(magicLinkExpiredMock)('challenge email factor with expired magic link', async t => {
    await setup(t);
    const terminalPageObject = await new TerminalPageObject(t);
    await t.expect(terminalPageObject.getMessages()).eql('This email link has expired. To resend it, return to the screen where you requested it.');
  });

test
  .requestHooks(logger, magicLinkEmailSentMock)('challenge email factor with magic link sent renders and has resend link', async t => {
    const challengeFactorPageObject = await setup(t);
    await t.expect(challengeFactorPageObject.resendEmailView().hasClass('hide')).ok();

    // wait for resend button to appear
    await t.wait(32000);
    // Making sure we keep polling while we wait for the resend view to appear
    // Widget will poll with a refresh interval of 4000(comes from API).
    // In 32000 seconds it will poll Math.floor(32000/4000) = 8 times
    await t.expect(logger.count(
      record => record.response.statusCode === 200 &&
      record.request.url.match(/poll/)
    )).eql(8);
    await t.expect(challengeFactorPageObject.resendEmailView().hasClass('hide')).notOk();
    const resendEmailView = challengeFactorPageObject.resendEmailView();
    await t.expect(resendEmailView.innerText).eql('Haven\'t received an email? Send again');
    await challengeFactorPageObject.clickSendAgainLink();
    await t.expect(challengeFactorPageObject.resendEmailView().hasClass('hide')).ok();
    await t.expect(logger.count(
      record => record.response.statusCode === 200 &&
      record.request.url.match(/poll|resend/)
    )).eql(9);
  });
