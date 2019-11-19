import IdentityPageObject from '../framework/page-objects/IdentityPageObject';
import ChallengeFactorPageObject from '../framework/page-objects/ChallengeFactorPageObject';
import { ClientFunction, RequestMock } from 'testcafe';
import factorRequiredEmail from '../../../playground/mocks/idp/idx/data/factor-verification-email';
import success from '../../../playground/mocks/idp/idx/data/success';
import invalidOTP from '../../../playground/mocks/idp/idx/data/error-email-verify';

const validOTPmock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx')
  .respond(factorRequiredEmail)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(factorRequiredEmail)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(success)

const inValidOTPmock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx')
  .respond(invalidOTP, 403)

fixture(`Challenge Email Form`)

async function setup(t) {
  const identityPage = new IdentityPageObject(t);
  await identityPage.navigateToPage();
  await identityPage.fillIdentifierField('Challenge Email');
  await identityPage.clickNextButton();
  return new ChallengeFactorPageObject(t);
}

test
  .requestHooks(validOTPmock)
  (`challenge email factor with valid OTP form has right labels`, async t => {
    const challengeFactorPageObject = await setup(t);
    const pageTitle = challengeFactorPageObject.getPageTitle();
    await t.expect(pageTitle).contains('Email link');
    const pageSubTitle = challengeFactorPageObject.getPageSubTitle('.okta-form-subtitle');
    await t.expect(pageSubTitle).contains('An email has been sent to you. Please click the link in your email or enter the code from that email below.');
  });

test
  .requestHooks(inValidOTPmock)
  (`challenge email factor with invalid OTP`, async t => {
    const challengeFactorPageObject = await setup(t);
    await challengeFactorPageObject.waitForErrorBox();
    await t.expect(challengeFactorPageObject.getInvalidOTPError()).contains('Authentication failed');
  });

const getPageUrl = ClientFunction(() => window.location.href);
test
  .requestHooks(validOTPmock)
  (`challenge email factor with valid OTP`, async t => {
    const challengeFactorPageObject = await setup(t);
    await challengeFactorPageObject.verifyFactor('credentials.passcode', '1234');
    await challengeFactorPageObject.clickNextButton();
    await t.expect(getPageUrl()).contains('stateToken=abc123');
  });
