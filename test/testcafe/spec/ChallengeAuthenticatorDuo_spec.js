import { RequestMock, RequestLogger } from 'testcafe';
import { checkA11y } from '../framework/a11y';

import SuccessPageObject from '../framework/page-objects/SuccessPageObject';
import DuoPageObject from '../framework/page-objects/DuoPageObject';
import xhrAuthenticatorVerifyDuo from '../../../playground/mocks/data/idp/idx/authenticator-verification-duo.json';
import success from '../../../playground/mocks/data/idp/idx/success.json';
import verificationTimeout from '../../../playground/mocks/data/idp/idx/error-authenticator-duo-verification-timeout.json';
import verificationFailed from '../../../playground/mocks/data/idp/idx/error-authenticator-duo-verification-failed.json';
import { checkConsoleMessages, renderWidget, mockDuoIframeHtml } from '../framework/shared';

const mock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorVerifyDuo)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(success)
  .onRequestTo('http://localhost:3000/mocks/spec-duo/duo-iframe.html')
  .respond(mockDuoIframeHtml);

const verificationTimeoutMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorVerifyDuo)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(verificationTimeout, 400)
  .onRequestTo('http://localhost:3000/mocks/spec-duo/duo-iframe.html')
  .respond(mockDuoIframeHtml);

const verificationFailedMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrAuthenticatorVerifyDuo)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(verificationFailed, 400)
  .onRequestTo('http://localhost:3000/mocks/spec-duo/duo-iframe.html')
  .respond(mockDuoIframeHtml);

const answerRequestLogger = RequestLogger(
  /idx\/challenge\/answer/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
  }
);

fixture('Challenge Duo').meta('v3', true);

async function setup(t) {
  const challengeDuoPage = new DuoPageObject(t);
  await challengeDuoPage.navigateToPage();
  await t.expect(challengeDuoPage.formExists()).eql(true);
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
    await checkA11y(t);

    await checkConsoleMessages({
      controller: 'mfa-verify-duo',
      formName: 'challenge-authenticator',
      authenticatorKey: 'duo',
      methodType: 'duo',
    });

    // Check title
    await t.expect(challengeDuoPage.getFormTitle()).eql('Verify with Duo Security');
    await t.expect(challengeDuoPage.hasDuoIframe()).eql(true);

    // Verify links
    await t.expect(await challengeDuoPage.verifyWithSomethingElseLinkExists()).ok();
    await t.expect(challengeDuoPage.getSwitchAuthenticatorLinkText()).eql('Verify with something else');
    await t.expect(await challengeDuoPage.signoutLinkExists()).ok();
    await t.expect(challengeDuoPage.getSignoutLinkText()).eql('Back to sign in');
  });

test
  .requestHooks(mock)('renders an iframe for Duo without sign-out link', async t => {
    const challengeDuoPage = await setup(t);
    await checkA11y(t);
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
  await checkA11y(t);
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
  await checkA11y(t);
  const duoPageObject = new DuoPageObject(t);

  await challengeDuoPage.clickDuoMockLink();

  await duoPageObject.form.waitForErrorBox();
  await t.expect(duoPageObject.form.getErrorBoxText()).eql('We were unable to verify with Duo. Try again.');
});

test.requestHooks(answerRequestLogger, verificationFailedMock)('verification failed', async t => {
  const challengeDuoPage = await setup(t);
  await checkA11y(t);
  const duoPageObject = new DuoPageObject(t);

  await challengeDuoPage.clickDuoMockLink();

  await duoPageObject.form.waitForErrorBox();
  await t.expect(duoPageObject.form.getErrorBoxText()).eql('We were unable to verify with Duo. Try again.');
});

test
  .requestHooks(mock)('should show custom factor page link', async t => {
    const challengeDuoPage = await setup(t);
    await checkA11y(t);

    await renderWidget({
      helpLinks: {
        factorPage: {
          text: 'custom factor page link',
          href: 'https://acme.com/what-is-okta-autheticators'
        }
      }
    });

    await t.expect(challengeDuoPage.getFactorPageHelpLinksLabel()).eql('custom factor page link');
    await t.expect(challengeDuoPage.getFactorPageHelpLink()).eql('https://acme.com/what-is-okta-autheticators');
  });
