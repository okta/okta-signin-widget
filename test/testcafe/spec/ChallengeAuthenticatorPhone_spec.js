import SuccessPageObject from '../framework/page-objects/SuccessPageObject';
import ChallengeFactorPageObject from '../framework/page-objects/ChallengeFactorPageObject';
import { RequestMock, RequestLogger } from 'testcafe';
import phoneVerificationSMSThenVoice from '../../../playground/mocks/data/idp/idx/authenticator-verification-phone';
import phoneVerificationVoiceThenSMS from '../../../playground/mocks/data/idp/idx/authenticator-verification-phone-voice-primary';
import phoneVerificationVoiceOnly from '../../../playground/mocks/data/idp/idx/authenticator-verification-phone-voice';
import success from '../../../playground/mocks/data/idp/idx/success';
import invalidCode from '../../../playground/mocks/data/idp/idx/error-email-verify';

const logger = RequestLogger(/poll|resend/);

const smsPrimaryMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(phoneVerificationSMSThenVoice)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(phoneVerificationSMSThenVoice)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(success);

const voicePrimaryMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(phoneVerificationVoiceThenSMS)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(phoneVerificationVoiceThenSMS)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(success);

const voiceOnlyMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(phoneVerificationVoiceOnly)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/poll')
  .respond(phoneVerificationVoiceOnly)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(success);

const invalidCodeMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(phoneVerificationSMSThenVoice)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(invalidCode, 403);

fixture(`Challenge Phone Form`);

async function setup(t) {
  const challengeFactorPageObject = new ChallengeFactorPageObject(t);
  challengeFactorPageObject.navigateToPage();
  return challengeFactorPageObject;
}

test
  .requestHooks(smsPrimaryMock)(`SMS primary - has the right labels`, async t => {
    const challengeFactorPageObject = await setup(t);
    const pageTitle = challengeFactorPageObject.getPageTitle();
    const pageSubtitle = challengeFactorPageObject.getFormSubtitle();
    const primaryButtonText = challengeFactorPageObject.getTextContent('.phone-authenticator-challenge__button--primary');
    const secondaryButtonText = challengeFactorPageObject
      .getTextContent('.phone-authenticator-challenge__button--secondary');
    await t.expect(pageTitle).contains('Verify with your phone');
    await t.expect(pageSubtitle).contains('Send a code via SMS to');
    await t.expect(primaryButtonText).contains('Send a code via SMS');
    await t.expect(secondaryButtonText).contains('Receive a voice call instead');
    await t.expect(challengeFactorPageObject.getFormSubtitle())
      .contains('Send a code via SMS to');
  });

test
  .requestHooks(smsPrimaryMock)(`SMS primary - clicking on primary button changes view`, async t => {
    const challengeFactorPageObject = await setup(t);
    await t.expect(challengeFactorPageObject.elementHasClass('.o-form-button-bar', 'hide')).eql(true);
    await t.expect(challengeFactorPageObject.elementHasClass('.o-form-fieldset', 'hide')).eql(true);
    await t.expect(challengeFactorPageObject.elementHasClass('.phone-authenticator-challenge__button--primary', 'hide')).eql(false);
    await t.expect(challengeFactorPageObject.elementHasClass('.phone-authenticator-challenge__button--secondary', 'hide')).eql(false);
    await challengeFactorPageObject.clickElement('.phone-authenticator-challenge__button--primary');
    const pageSubtitle = challengeFactorPageObject.getFormSubtitle();
    await t.expect(challengeFactorPageObject.getSaveButtonLabel('input[type="submit"]')).eql('Verify');
    await t.expect(pageSubtitle).contains('A code was sent to');
    await t.expect(pageSubtitle).contains('Enter the code below to verify.');
    await t.expect(challengeFactorPageObject.elementHasClass('.o-form-button-bar', 'hide')).eql(false);
    await t.expect(challengeFactorPageObject.elementHasClass('.o-form-fieldset', 'hide')).eql(false);
    await t.expect(challengeFactorPageObject.elementHasClass('.phone-authenticator-challenge__button--primary', 'hide')).eql(true);
    await t.expect(challengeFactorPageObject.elementHasClass('.phone-authenticator-challenge__button--secondary', 'hide')).eql(true);
  });

test
  .requestHooks(smsPrimaryMock)(`SMS primary - clicking on secondary button changes view`, async t => {
    const challengeFactorPageObject = await setup(t);
    await t.expect(challengeFactorPageObject.elementHasClass('.o-form-button-bar', 'hide')).eql(true);
    await t.expect(challengeFactorPageObject.elementHasClass('.o-form-fieldset', 'hide')).eql(true);
    await t.expect(challengeFactorPageObject.elementHasClass('.phone-authenticator-challenge__button--primary', 'hide')).eql(false);
    await t.expect(challengeFactorPageObject.elementHasClass('.phone-authenticator-challenge__button--secondary', 'hide')).eql(false);
    await challengeFactorPageObject.clickElement('.phone-authenticator-challenge__button--secondary');
    const pageSubtitle = challengeFactorPageObject.getFormSubtitle();
    await t.expect(pageSubtitle).contains('Calling');
    await t.expect(pageSubtitle).contains('Enter the code below to verify.');
    await t.expect(challengeFactorPageObject.getSaveButtonLabel('input[type="submit"]')).eql('Verify');
    await t.expect(challengeFactorPageObject.elementHasClass('.o-form-button-bar', 'hide')).eql(false);
    await t.expect(challengeFactorPageObject.elementHasClass('.o-form-fieldset', 'hide')).eql(false);
    await t.expect(challengeFactorPageObject.elementHasClass('.phone-authenticator-challenge__button--primary', 'hide')).eql(true);
    await t.expect(challengeFactorPageObject.elementHasClass('.phone-authenticator-challenge__button--secondary', 'hide')).eql(true);
  });

test
  .requestHooks(voicePrimaryMock)(`Voice Primary - has the right labels`, async t => {
    const challengeFactorPageObject = await setup(t);
    const pageTitle = challengeFactorPageObject.getPageTitle();
    const pageSubtitle = challengeFactorPageObject.getFormSubtitle();
    const primaryButtonText = challengeFactorPageObject.getTextContent('.phone-authenticator-challenge__button--primary');
    const secondaryButtonText = challengeFactorPageObject
      .getTextContent('.phone-authenticator-challenge__button--secondary');
    await t.expect(pageTitle).contains('Verify with your phone');
    await t.expect(pageSubtitle).contains('Send a code via voice call to');
    await t.expect(primaryButtonText).contains('Send a code via voice call');
    await t.expect(secondaryButtonText).contains('Receive an SMS instead');
    await t.expect(challengeFactorPageObject.getFormSubtitle())
      .contains('Send a code via voice call to');
  });

test
  .requestHooks(voicePrimaryMock)(`Voice Primary - clicking on primary button changes view`, async t => {
    const challengeFactorPageObject = await setup(t);
    await t.expect(challengeFactorPageObject.elementHasClass('.o-form-button-bar', 'hide')).eql(true);
    await t.expect(challengeFactorPageObject.elementHasClass('.o-form-fieldset', 'hide')).eql(true);
    await t.expect(challengeFactorPageObject.elementHasClass('.phone-authenticator-challenge__button--primary', 'hide')).eql(false);
    await t.expect(challengeFactorPageObject.elementHasClass('.phone-authenticator-challenge__button--secondary', 'hide')).eql(false);
    await challengeFactorPageObject.clickElement('.phone-authenticator-challenge__button--primary');
    const pageSubtitle = challengeFactorPageObject.getFormSubtitle();
    await t.expect(challengeFactorPageObject.getSaveButtonLabel('input[type="submit"]')).eql('Verify');
    await t.expect(pageSubtitle).contains('Calling');
    await t.expect(pageSubtitle).contains('Enter the code below to verify.');
    await t.expect(challengeFactorPageObject.elementHasClass('.o-form-button-bar', 'hide')).eql(false);
    await t.expect(challengeFactorPageObject.elementHasClass('.o-form-fieldset', 'hide')).eql(false);
    await t.expect(challengeFactorPageObject.elementHasClass('.phone-authenticator-challenge__button--primary', 'hide')).eql(true);
    await t.expect(challengeFactorPageObject.elementHasClass('.phone-authenticator-challenge__button--secondary', 'hide')).eql(true);
  });

test
  .requestHooks(voicePrimaryMock)(`Voice Primary - clicking on secondary button changes view`, async t => {
    const challengeFactorPageObject = await setup(t);
    await t.expect(challengeFactorPageObject.elementHasClass('.o-form-button-bar', 'hide')).eql(true);
    await t.expect(challengeFactorPageObject.elementHasClass('.o-form-fieldset', 'hide')).eql(true);
    await t.expect(challengeFactorPageObject.elementHasClass('.phone-authenticator-challenge__button--primary', 'hide')).eql(false);
    await t.expect(challengeFactorPageObject.elementHasClass('.phone-authenticator-challenge__button--secondary', 'hide')).eql(false);
    await challengeFactorPageObject.clickElement('.phone-authenticator-challenge__button--secondary');
    const pageSubtitle = challengeFactorPageObject.getFormSubtitle();
    await t.expect(pageSubtitle).contains('A code was sent to');
    await t.expect(pageSubtitle).contains('Enter the code below to verify.');
    await t.expect(challengeFactorPageObject.getSaveButtonLabel('input[type="submit"]')).eql('Verify');
    await t.expect(challengeFactorPageObject.elementHasClass('.o-form-button-bar', 'hide')).eql(false);
    await t.expect(challengeFactorPageObject.elementHasClass('.o-form-fieldset', 'hide')).eql(false);
    await t.expect(challengeFactorPageObject.elementHasClass('.phone-authenticator-challenge__button--primary', 'hide')).eql(true);
    await t.expect(challengeFactorPageObject.elementHasClass('.phone-authenticator-challenge__button--secondary', 'hide')).eql(true);
  });

test
  .requestHooks(voiceOnlyMock)(`Voice Primary - clicking on primary button changes view`, async t => {
    const challengeFactorPageObject = await setup(t);
    await t.expect(challengeFactorPageObject.elementHasClass('.o-form-button-bar', 'hide')).eql(true);
    await t.expect(challengeFactorPageObject.elementHasClass('.o-form-fieldset', 'hide')).eql(true);
    await t.expect(challengeFactorPageObject.elementHasClass('.phone-authenticator-challenge__button--primary', 'hide')).eql(false);
    await t.expect(challengeFactorPageObject.elementExists('.phone-authenticator-challenge__button--secondary')).eql(false);
    await challengeFactorPageObject.clickElement('.phone-authenticator-challenge__button--primary');
    const pageSubtitle = challengeFactorPageObject.getFormSubtitle();
    await t.expect(challengeFactorPageObject.getSaveButtonLabel('input[type="submit"]')).eql('Verify');
    await t.expect(pageSubtitle).contains('Calling');
    await t.expect(pageSubtitle).contains('Enter the code below to verify.');
    await t.expect(challengeFactorPageObject.elementHasClass('.o-form-button-bar', 'hide')).eql(false);
    await t.expect(challengeFactorPageObject.elementHasClass('.o-form-fieldset', 'hide')).eql(false);
    await t.expect(challengeFactorPageObject.elementHasClass('.phone-authenticator-challenge__button--primary', 'hide')).eql(true);
    await t.expect(challengeFactorPageObject.elementExists('.phone-authenticator-challenge__button--secondary')).eql(false);
  });

test
  .requestHooks(invalidCodeMock)(`Entering invalid passcode results in an error`, async t => {
    const challengeFactorPageObject = await setup(t);
    await challengeFactorPageObject.clickElement('.phone-authenticator-challenge__button--primary');
    await challengeFactorPageObject.verifyFactor('credentials.passcode', 'abcd');
    await challengeFactorPageObject.clickNextButton();
    await challengeFactorPageObject.waitForErrorBox();
    await t.expect(challengeFactorPageObject.getInvalidOTPError()).contains('Authentication failed');
  });

test
  .requestHooks(logger, smsPrimaryMock)(`SMS Primary - Callout appears
    after 30 seconds once the user clicks on send code button`, async t => {
    const challengeFactorPageObject = await setup(t);
    await challengeFactorPageObject.clickElement('.phone-authenticator-challenge__button--primary');
    await t.expect(challengeFactorPageObject.resendEmailView('.phone-authenticator-challenge__resend-warning').hasClass('hide')).ok();
    // wait for resend button to appear
    await t.wait(32000);
    // Making sure we keep polling while we wait for the resend view to appear
    // Widget will poll with a refresh interval of 4000(comes from API).
    // In 32000 seconds it will poll Math.floor(32000/4000) = 8 times
    await t.expect(
      logger.count(record => record.response.statusCode === 200
        && record.request.url.match(/poll/))
    ).eql(8);
    await t.expect(challengeFactorPageObject.resendEmailView('.phone-authenticator-challenge__resend-warning').hasClass('hide')).notOk();
    const resendEmailView = challengeFactorPageObject.resendEmailView('.phone-authenticator-challenge__resend-warning');
    await t.expect(resendEmailView.innerText).eql('Haven\'t received an SMS? Send again');
    await challengeFactorPageObject.clickSendAgainLink('.phone-authenticator-challenge__resend-warning');
    
    await t.expect(logger.count(
      record => record.response.statusCode === 200 &&
      record.request.url.match(/poll|resend/)
    )).eql(9);
  });

test
  .requestHooks(logger, voicePrimaryMock)(`Voice Primary - Callout appears after 30 seconds once the user clicks on
    send code button`, async t => {
    const challengeFactorPageObject = await setup(t);
    await challengeFactorPageObject.clickElement('.phone-authenticator-challenge__button--primary');
    await t.expect(challengeFactorPageObject.resendEmailView('.phone-authenticator-challenge__resend-warning').hasClass('hide')).ok();
    await t.wait(32000);
    await t.expect(
      logger.count(record => record.response.statusCode === 200
        && record.request.url.match(/poll/))
    ).eql(8);
    await t.expect(challengeFactorPageObject.resendEmailView('.phone-authenticator-challenge__resend-warning').hasClass('hide')).notOk();
    const resendEmailView = challengeFactorPageObject.resendEmailView('.phone-authenticator-challenge__resend-warning');
    await t.expect(resendEmailView.innerText).eql('Haven\'t received a call? Call again');
    await challengeFactorPageObject.clickSendAgainLink('.phone-authenticator-challenge__resend-warning');
    
    await t.expect(logger.count(
      record => record.response.statusCode === 200 &&
      record.request.url.match(/poll|resend/)
    )).eql(9);
  });

test
  .requestHooks(logger, smsPrimaryMock)(`Filling up code field and submitting results in success`, async t => {
    const challengeFactorPageObject = await setup(t);
    await challengeFactorPageObject.clickElement('.phone-authenticator-challenge__button--primary');
    await challengeFactorPageObject.verifyFactor('credentials.passcode', '1234');
    await challengeFactorPageObject.clickNextButton();
    const successPage = new SuccessPageObject(t);
    const pageUrl = await successPage.getPageUrl();
    await t.expect(pageUrl)
      .eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
  });