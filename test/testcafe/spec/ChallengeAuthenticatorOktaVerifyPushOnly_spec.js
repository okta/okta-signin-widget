import { RequestMock, RequestLogger, userVariables } from 'testcafe';
import { checkA11y } from '../framework/a11y';

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
  await t.expect(challengeOktaVerifyPushPageObject.formExists()).ok();
  return challengeOktaVerifyPushPageObject;
}

test.requestHooks(mockOktaVerifySendPushOnly)(
  'should load view with a button and a checkbox when push is the only method type and has auto challenge schema',
  async t => {
    const challengeOktaVerifyPushPageObject = await setup(t);
    await checkA11y(t);
    await t.expect(await challengeOktaVerifyPushPageObject.isOktaVerifySendPushForm()).ok();
    await t.expect(challengeOktaVerifyPushPageObject.getFormTitle()).eql('Get a push notification');
    await t.expect(challengeOktaVerifyPushPageObject.subtitleExists()).notOk();

    const pushButtonLabel = challengeOktaVerifyPushPageObject.getSaveButtonLabel();
    await t.expect(pushButtonLabel).eql('Send push');

    await t.expect(await challengeOktaVerifyPushPageObject.autoChallengeInputExists()).ok();
    const checkboxLabel = challengeOktaVerifyPushPageObject.getAutoChallengeCheckboxLabel();
    if (!userVariables.gen3) {
      await t.expect(checkboxLabel.hasClass('checked')).notOk();
    }
    await t.expect(await challengeOktaVerifyPushPageObject.form.fieldByLabelExists('Send push automatically')).eql(true);

    // select checkbox on click
    await challengeOktaVerifyPushPageObject.clickAutoChallengeCheckbox();
    await t.expect(challengeOktaVerifyPushPageObject.getAutoPushValue()).eql(true);

    // signout link at enroll page
    await t.expect(await challengeOktaVerifyPushPageObject.signoutLinkExists()).ok();
    await t.expect(challengeOktaVerifyPushPageObject.getSignoutLinkText()).eql('Back to sign in');
  }
);

test.requestHooks(requestLogger, mockChallengeOVSendPush)(
  'should navigate to okta verify push page on clicking send push button', async t => {
    const challengeOktaVerifyPushPageObject = await setup(t);
    await checkA11y(t);
    await t.expect(challengeOktaVerifyPushPageObject.getFormTitle()).eql('Get a push notification');

    challengeOktaVerifyPushPageObject.clickSendPushButton();
    const challengeFactorPage = new ChallengeFactorPageObject(t);
    if(userVariables.gen3) {
      await t.expect(challengeFactorPage.getFormTitle()).eql('Push notification sent');
    } else {
      await t.expect(challengeFactorPage.getFormTitle()).eql('Verify with Custom Push');
    }

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
