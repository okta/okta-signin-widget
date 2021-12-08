import { RequestMock, RequestLogger } from 'testcafe';

import ChallengeOktaVerifyPushPageObject from '../framework/page-objects/ChallengeOktaVerifyPushPageObject';
import ChallengeFactorPageObject from '../framework/page-objects/ChallengeFactorPageObject';

import xhrSelectAuthenticatorOVWithMethodSendPushOnly from '../../../playground/mocks/data/idp/idx/authenticator-verification-data-okta-verify-push-autoChallenge-off';
import xhrAuthenticatorOVPushWithAutoChallenge from '../../../playground/mocks/data/idp/idx/authenticator-verification-okta-verify-push-autoChallenge-on';

const requestLogger = RequestLogger(
  /introspect|\/challenge/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
  }
);

const mockOktaVerifySendPushOnly = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrSelectAuthenticatorOVWithMethodSendPushOnly);

const mockChallengeOVSendPush = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(xhrSelectAuthenticatorOVWithMethodSendPushOnly)
  .onRequestTo('http://localhost:3000/idp/idx/challenge')
  .respond(xhrAuthenticatorOVPushWithAutoChallenge);

fixture('Challenge Authenticator Okta Verify Push Only With Auto Challenge Form');

async function setup(t) {
  const challengeOktaVerifyPushPageObject = new ChallengeOktaVerifyPushPageObject(t);
  await challengeOktaVerifyPushPageObject.navigateToPage();
  return challengeOktaVerifyPushPageObject;
}

test.requestHooks(mockOktaVerifySendPushOnly)('should load view with a button and a checkbox when push is the only method type', async t => {
  const AUTO_CHALLENGE_CHECKBOX_SELECTOR = '[name="authenticator.autoChallenge"]';
  const AUTO_CHALLENGE_CHECKBOX_LABEL_SELECTOR = '[data-se-for-name="authenticator.autoChallenge"]';
  const challengeOktaVerifyPushPageObject = await setup(t);
  await t.expect(await challengeOktaVerifyPushPageObject.isOktaVerifyPushChallengeForm()).ok();
  await t.expect(challengeOktaVerifyPushPageObject.getFormTitle()).eql('Get a push notification');
  await t.expect(challengeOktaVerifyPushPageObject.subtitleExists()).notOk();

  const pushBtn = challengeOktaVerifyPushPageObject.getPushButton();
  await t.expect(pushBtn.textContent).contains('Send push');
  await t.expect(pushBtn.hasClass('link-button-disabled')).notOk();
  const a11ySpan = challengeOktaVerifyPushPageObject.getA11ySpan();
  await t.expect(a11ySpan.textContent).contains('Send push');

  await t.expect(await challengeOktaVerifyPushPageObject.autoChallengeInputExists(AUTO_CHALLENGE_CHECKBOX_SELECTOR)).ok();
  const checkboxLabel = challengeOktaVerifyPushPageObject.getAutoChallengeCheckboxLabel(AUTO_CHALLENGE_CHECKBOX_LABEL_SELECTOR);
  await t.expect(checkboxLabel.hasClass('checked')).notOk();
  await t.expect(checkboxLabel.textContent).eql('Send push automatically');

  // select checkbox on click
  await challengeOktaVerifyPushPageObject.clickAutoChallengeCheckbox(AUTO_CHALLENGE_CHECKBOX_LABEL_SELECTOR);
  await t.expect(checkboxLabel.hasClass('checked')).ok();

  // signout link at enroll page
  await t.expect(await challengeOktaVerifyPushPageObject.signoutLinkExists()).ok();
  await t.expect(challengeOktaVerifyPushPageObject.getSignoutLinkText()).eql('Back to sign in');
});

test.requestHooks(requestLogger, mockChallengeOVSendPush)(
  'should navigate to okta verify push page on clicking send push button', async t => {
    const challengeOktaVerifyPushPageObject = await setup(t);
    await t.expect(challengeOktaVerifyPushPageObject.getFormTitle()).eql('Get a push notification');

    challengeOktaVerifyPushPageObject.clickSendPushButton();
    const challengeFactorPage = new ChallengeFactorPageObject(t);
    await t.expect(challengeFactorPage.getFormTitle()).eql('Get a push notification');

    await t.expect(requestLogger.count(() => true)).eql(2);
    const req1 = requestLogger.requests[0].request;
    await t.expect(req1.url).eql('http://localhost:3000/idp/idx/introspect');

    const req2 = requestLogger.requests[1].request;
    await t.expect(req2.url).eql('http://localhost:3000/idp/idx/challenge');
    await t.expect(req2.method).eql('post');
    await t.expect(JSON.parse(req2.body)).eql({
      'authenticator': {
        'id': 'aut1ejvmCE1iWalJR0g4',
        'methodType': 'push',
        'autoChallenge': false,
      },
      'stateHandle': '02f9EONFMnQZtAQHl7Gf4Ye-R4mXc8cOhBUSMc7ubQ'
    });
  }
);
