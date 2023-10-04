import { RequestMock } from 'testcafe';
import { checkA11y } from '../framework/a11y';
import ChallengeEmailPageObject from '../framework/page-objects/ChallengeEmailPageObject';
import SelectFactorPageObject from '../framework/page-objects/SelectAuthenticatorPageObject';
import { checkConsoleMessages } from '../framework/shared';

import emailAuthenticatorPreEnrollData from '../../../playground/mocks/data/idp/idx/authenticator-enroll-email-first';
import emailVerification from '../../../playground/mocks/data/idp/idx/authenticator-enroll-email-first-emailmagiclink-true';

fixture('Pre-Enroll Email Authenticator Form');

async function setup(t) {
  const challengeEmailPageObject = new ChallengeEmailPageObject(t);
  await challengeEmailPageObject.navigateToPage();
  await challengeEmailPageObject.formExists();
  return challengeEmailPageObject;
}

const sendEmailMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(emailAuthenticatorPreEnrollData)
  .onRequestTo('http://localhost:3000/idp/idx/credential/enroll')
  .respond(emailVerification)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(emailVerification);

test
  .requestHooks(sendEmailMock)('send email screen should have right labels', async t => {
    const challengeEmailPageObject = await setup(t);
    await checkA11y(t);
    await challengeEmailPageObject.formExists();
    await checkConsoleMessages({
      controller: null,
      formName: 'authenticator-enrollment-data',
      authenticatorKey: 'okta_email',
      methodType: 'email',
    });

    const pageTitle = challengeEmailPageObject.getFormTitle();
    const saveBtnText = challengeEmailPageObject.getSaveButtonLabel();
    await t.expect(pageTitle).eql('Get a verification email');
    await t.expect(saveBtnText).eql('Send me an email');

    await t.expect(challengeEmailPageObject.getFormSubtitle())
      .eql('Send a verification email by clicking on "Send me an email".');

    // Verify links (switch authenticator link present since for the only email authenticator available)
    await t.expect(await challengeEmailPageObject.returnToAuthenticatorListLinkExists()).ok();
    await t.expect(await challengeEmailPageObject.signoutLinkExists()).ok();
    await t.expect(challengeEmailPageObject.getSignoutLinkText()).eql('Back to sign in');

    // clicking switch authenticator link should display only email authenticator
    await challengeEmailPageObject.clickReturnToAuthenticatorListLink();
    const selectFactorPageObject = new SelectFactorPageObject(t);
    await t.expect(selectFactorPageObject.getFormTitle()).eql('Set up security methods');
    await t.expect(selectFactorPageObject.getFormSubtitle()).eql(
      'Security methods help protect your account by ensuring only you have access.');
    await t.expect(selectFactorPageObject.getFactorsCount()).eql(1);
    await t.expect(selectFactorPageObject.getFactorLabelByIndex(0)).eql('Email');
    await t.expect(selectFactorPageObject.getFactorIconClassByIndex(0)).contains('okta-email');
    await t.expect(selectFactorPageObject.getFactorSelectButtonByIndex(0)).eql('Set up');
    await t.expect(selectFactorPageObject.getFactorSelectButtonDataSeByIndex(0)).eql('okta_email');
    await t.expect(selectFactorPageObject.getFactorDescriptionByIndex(0)).eql('Verify with a link or code sent to your email');
    await t.expect(await selectFactorPageObject.factorUsageTextExistsByIndex(0)).eql(true);
  });

test
  .requestHooks(sendEmailMock)('send me an email button should take to pre-enroll email authenticator screen', async t => {
    const challengeEmailPageObject = await setup(t);
    await checkA11y(t);
    await challengeEmailPageObject.clickNextButton('Send me an email');
    const pageTitle = challengeEmailPageObject.getFormTitle();
    await t.expect(pageTitle).eql('Verify with your email');

    const emailAddress = emailVerification.user.value.identifier;
    await t.expect(challengeEmailPageObject.getFormSubtitle())
      .eql(`We sent an email to ${emailAddress}. Click the verification link in your email to continue or enter the code below.`);
    await t.expect(challengeEmailPageObject.getEnterCodeInsteadButton().exists).eql(true);

    // Verify links (switch authenticator link present since for the only email authenticator available)
    await t.expect(await challengeEmailPageObject.returnToAuthenticatorListLinkExists()).ok();
    await t.expect(await challengeEmailPageObject.signoutLinkExists()).ok();
    await t.expect(challengeEmailPageObject.getSignoutLinkText()).eql('Back to sign in');

    // clicking switch authenticator link should display only email authenticator
    await challengeEmailPageObject.clickReturnToAuthenticatorListLink();
    const selectFactorPageObject = new SelectFactorPageObject(t);
    await t.expect(selectFactorPageObject.getFormTitle()).eql('Set up security methods');
    await t.expect(selectFactorPageObject.getFormSubtitle()).eql(
      'Security methods help protect your account by ensuring only you have access.');
    await t.expect(selectFactorPageObject.getFactorsCount()).eql(1);
    await t.expect(selectFactorPageObject.getFactorLabelByIndex(0)).eql('Email');
    await t.expect(selectFactorPageObject.getFactorIconClassByIndex(0)).contains('okta-email');
    await t.expect(selectFactorPageObject.getFactorSelectButtonByIndex(0)).eql('Set up');
    await t.expect(selectFactorPageObject.getFactorSelectButtonDataSeByIndex(0)).eql('okta_email');
    await t.expect(selectFactorPageObject.getFactorDescriptionByIndex(0)).eql('Verify with a link or code sent to your email');
    await t.expect(await selectFactorPageObject.factorUsageTextExistsByIndex(0)).eql(true);
  });
