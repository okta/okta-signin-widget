import SuccessPageObject from '../framework/page-objects/SuccessPageObject';
import ChallengeFactorPageObject from '../framework/page-objects/ChallengeFactorPageObject';
import { RequestMock } from 'testcafe';
import factorRequiredEmail from '../../../playground/mocks/idp/idx/data/factor-verification-email';
import success from '../../../playground/mocks/idp/idx/data/success';
import invalidOTP from '../../../playground/mocks/idp/idx/data/error-email-verify';

const validOTPmock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(factorRequiredEmail)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(factorRequiredEmail)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(success);

const inValidOTPmock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(factorRequiredEmail)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(invalidOTP, 403);

fixture(`Challenge Email Form`);

async function setup(t) {
  const challengeFactorPageObject = new ChallengeFactorPageObject(t);
  challengeFactorPageObject.navigateToPage();
  return challengeFactorPageObject;
}

test
  .requestHooks(validOTPmock)(`challenge email factor with valid OTP form has right labels`, async t => {
    const challengeFactorPageObject = await setup(t);
    const pageTitle = challengeFactorPageObject.getPageTitle();
    const saveBtnText = challengeFactorPageObject.getSaveButtonLabel();
    await t.expect(saveBtnText).contains('Verify');
    await t.expect(pageTitle).contains('Verify with Email Authentication');
    await t.expect(challengeFactorPageObject.getFormSubtitle())
        .contains('A verification code was sent to inca@clouditude.net. Check your email and enter the code below.');
  });

test
  .requestHooks(inValidOTPmock)(`challenge email factor with invalid OTP`, async t => {
    const challengeFactorPageObject = await setup(t);
    await challengeFactorPageObject.verifyFactor('credentials.passcode', 'xyz');
    await challengeFactorPageObject.clickNextButton();
    await challengeFactorPageObject.waitForErrorBox();
    await t.expect(challengeFactorPageObject.getInvalidOTPError()).contains('Authentication failed');
  });

test
  .requestHooks(validOTPmock)(`challenge email factor with valid OTP`, async t => {
    const challengeFactorPageObject = await setup(t);
    await challengeFactorPageObject.verifyFactor('credentials.passcode', '1234');
    await challengeFactorPageObject.clickNextButton();
    const successPage = new SuccessPageObject(t);
    const pageUrl = await successPage.getPageUrl();
    await t.expect(pageUrl)
      .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
  });
