import { RequestMock } from 'testcafe';
import ChallengeEmailPageObject from '../framework/page-objects/ChallengeEmailPageObject';
import { checkConsoleMessages } from '../framework/shared';

import emailAuthenticatorPreEnrollData from '../../../playground/mocks/data/idp/idx/authenticator-pre-enroll-email';
import emailVerification from '../../../playground/mocks/data/idp/idx/authenticator-pre-enroll-email-emailmagiclink-true';

const getVerificationEmailTitle = 'Get a verification email';
const saveBtnLabelText = 'Send me an email';
const enterVerificationCode = 'Enter a verification code instead';

fixture('Pre-Enroll Email Authenticator Form');

async function setup(t) {
  const challengeEmailPageObject = new ChallengeEmailPageObject(t);
  await challengeEmailPageObject.navigateToPage();
  return challengeEmailPageObject;
}

const sendEmailMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(emailAuthenticatorPreEnrollData)
  .onRequestTo('http://localhost:3000/idp/idx/credential/enroll')
  .respond(emailVerification);

test
  .requestHooks(sendEmailMock)('send email screen should have right labels', async t => {
    const challengeEmailPageObject = await setup(t);
    await checkConsoleMessages({
      controller: null,
      formName: 'authenticator-pre-enrollment-data',
      authenticatorKey: 'okta_email',
      methodType: 'email',
    });

    const pageTitle = challengeEmailPageObject.getFormTitle();
    const saveBtnText = challengeEmailPageObject.getSaveButtonLabel();
    await t.expect(pageTitle).eql(getVerificationEmailTitle);
    await t.expect(saveBtnText).eql(saveBtnLabelText);

    await t.expect(challengeEmailPageObject.getFormSubtitle())
      .eql('Send a verification email by clicking on "Send me an email".');

    // Verify links (switch authenticator link not present since there are no other authenticators available)
    await t.expect(await challengeEmailPageObject.switchAuthenticatorLinkExists()).notOk();
    await t.expect(await challengeEmailPageObject.signoutLinkExists()).ok();
    await t.expect(challengeEmailPageObject.getSignoutLinkText()).eql('Back to sign in');
  });

test
  .requestHooks(sendEmailMock)('send me an email button should take to pre-enroll email authenticator screen', async t => {
    const challengeEmailPageObject = await setup(t);
    await challengeEmailPageObject.clickNextButton();
    const pageTitle = challengeEmailPageObject.getFormTitle();
    await t.expect(pageTitle).eql('Verify with your email');

    const emailAddress = emailVerification.user.value.identifier;
    await t.expect(challengeEmailPageObject.getFormSubtitle())
      .eql(`We sent an email to ${emailAddress}. Click the verification link in your email to continue or enter the code below.`);
    const enterVerificationCodeText = challengeEmailPageObject.getEnterVerificationCodeText();
    await t.expect(enterVerificationCodeText).eql(enterVerificationCode);

    // Verify links (switch authenticator link not present since there are no other authenticators available)
    await t.expect(await challengeEmailPageObject.switchAuthenticatorLinkExists()).notOk();
    await t.expect(await challengeEmailPageObject.signoutLinkExists()).ok();
    await t.expect(challengeEmailPageObject.getSignoutLinkText()).eql('Back to sign in');
  });
