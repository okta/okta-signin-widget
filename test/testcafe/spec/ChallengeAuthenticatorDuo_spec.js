import { RequestMock, RequestLogger } from 'testcafe';

import SuccessPageObject from '../framework/page-objects/SuccessPageObject';
import DuoPageObject from '../framework/page-objects/DuoPageObject';
import xhrAuthenticatorVerifyDuo from '../../../playground/mocks/data/idp/idx/authenticator-verification-duo';
import success from '../../../playground/mocks/data/idp/idx/success';

const mock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorVerifyDuo)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(success);

const answerRequestLogger = RequestLogger(
  /idx\/challenge\/answer/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
  }
);

fixture('Challenge Duo');

async function setup(t) {
  const challengeDuoPage = new DuoPageObject(t);
  await challengeDuoPage.navigateToPage();

  const { log } = await t.getBrowserConsoleMessages();
  await t.expect(log.length).eql(3);
  await t.expect(log[0]).eql('===== playground widget ready event received =====');
  await t.expect(log[1]).eql('===== playground widget afterRender event received =====');
  await t.expect(JSON.parse(log[2])).eql({
    controller: 'mfa-verify-duo',
    formName: 'challenge-authenticator',
    authenticatorKey: 'duo',
    methodType: 'idp'
  });

  return challengeDuoPage;
}

test
  .requestHooks(mock)('renders an iframe for Duo', async t => {
    const challengeDuoPage = await setup(t);

    const { log } = await t.getBrowserConsoleMessages();
    await t.expect(log.length).eql(3);
    await t.expect(log[0]).eql('===== playground widget ready event received =====');
    await t.expect(log[1]).eql('===== playground widget afterRender event received =====');
    await t.expect(JSON.parse(log[2])).eql({
      controller: 'mfa-verify-duo',
      formName: 'challenge-authenticator',
      authenticatorKey: 'duo',
      methodType: 'idp',
    });

    // Check title
    await t.expect(challengeDuoPage.getFormTitle()).eql('Verify with Duo Security');
    await t.expect(challengeDuoPage.hasDuoIframe()).eql(true);

    await t.expect(await challengeDuoPage.signoutLinkExists()).ok();
    await t.expect(challengeDuoPage.getSignoutLinkText()).eql('Sign Out');
  });

test.requestHooks(answerRequestLogger, mock)('verifies successfully', async t => {
  const challengeDuoPage = await setup(t);
  const successPage = new SuccessPageObject(t);

  await challengeDuoPage.clickDuoMockLink();

  const pageUrl = await successPage.getPageUrl();
  await t.expect(pageUrl)
    .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');

  await t.expect(answerRequestLogger.count(() => true)).eql(1);
  const req = answerRequestLogger.requests[0].request;
  const reqBody = JSON.parse(req.body);
  await t.expect(reqBody).eql({
    credentials: {
      signatureData: 'successDuoAuth'
    },
    stateHandle: '02ev9pxLx_-ZmnKfXivIMDSnsrbwiCel6StcoRcdtB',
  });
  await t.expect(req.method).eql('post');
  await t.expect(req.url).eql('http://localhost:3000/idp/idx/challenge/answer');
});
