import { RequestMock, RequestLogger } from 'testcafe';

import SuccessPageObject from '../framework/page-objects/SuccessPageObject';
import DuoPageObject from '../framework/page-objects/DuoPageObject';
import xhrAuthenticatorVerifyDuo from '../../../playground/mocks/data/idp/idx/authenticator-verification-duo';
import success from '../../../playground/mocks/data/idp/idx/success';
import verificationTimeout from '../../../playground/mocks/data/idp/idx/error-authenticator-duo-verification-timeout';
import verificationFailed from '../../../playground/mocks/data/idp/idx/error-authenticator-duo-verification-failed';
import { checkConsoleMessages, renderWidget } from '../framework/shared';

const mock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorVerifyDuo)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(success);

const verificationTimeoutMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorVerifyDuo)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(verificationTimeout, 400);

const verificationFailedMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorVerifyDuo)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(verificationFailed, 400);

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
  await checkConsoleMessages({
    controller: 'mfa-verify-duo',
    formName: 'challenge-authenticator',
    authenticatorKey: 'duo',
    methodType: 'duo'
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
      methodType: 'duo',
    });

    // Check title
    await t.expect(challengeDuoPage.getFormTitle()).eql('Verify with Duo Security');
    await t.expect(challengeDuoPage.hasDuoIframe()).eql(true);

    await t.expect(await challengeDuoPage.signoutLinkExists()).ok();
    await t.expect(challengeDuoPage.getSignoutLinkText()).eql('Back to sign in');
  });

test
  .requestHooks(mock)('renders an iframe for Duo without sign-out link', async t => {
    const challengeDuoPage = await setup(t);
    await renderWidget({
      features: { hideSignOutLinkInMFA: true },
    });

    // Check title
    await t.expect(challengeDuoPage.getFormTitle()).eql('Verify with Duo Security');
    // signout link is not visible
    await t.expect(await challengeDuoPage.signoutLinkExists()).notOk();
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

test.requestHooks(answerRequestLogger, verificationTimeoutMock)('verification timeout', async t => {
  const challengeDuoPage = await setup(t);
  const duoPageObject = new DuoPageObject(t);

  await challengeDuoPage.clickDuoMockLink();

  await duoPageObject.form.waitForErrorBox();
  await t.expect(duoPageObject.form.getErrorBoxText()).eql('We were unable to verify with Duo. Try again.');
});

test.requestHooks(answerRequestLogger, verificationFailedMock)('verification failed', async t => {
  const challengeDuoPage = await setup(t);
  const duoPageObject = new DuoPageObject(t);

  await challengeDuoPage.clickDuoMockLink();

  await duoPageObject.form.waitForErrorBox();
  await t.expect(duoPageObject.form.getErrorBoxText()).eql('We were unable to verify with Duo. Try again.');
});
