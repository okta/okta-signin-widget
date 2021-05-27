import SuccessPageObject from '../framework/page-objects/SuccessPageObject';
import ChallengePhonePageObject from '../framework/page-objects/ChallengePhonePageObject';
import { checkConsoleMessages, renderWidget } from '../framework/shared';
import { RequestMock, RequestLogger } from 'testcafe';
import phoneVerificationSMSThenVoice from '../../../playground/mocks/data/idp/idx/authenticator-verification-data-phone-sms-then-voice';
import phoneVerificationVoiceThenSMS from '../../../playground/mocks/data/idp/idx/authenticator-verification-data-phone-voice-then-sms';
import phoneVerificationVoiceOnly from '../../../playground/mocks/data/idp/idx/authenticator-verification-data-phone-voice-only';
import smsVerification from '../../../playground/mocks/data/idp/idx/authenticator-verification-phone-sms';
import voiceVerification from '../../../playground/mocks/data/idp/idx/authenticator-verification-phone-voice';
import phoneVerificationSMSThenVoiceNoProfile from '../../../playground/mocks/data/idp/idx/authenticator-verification-data-phone-sms-then-voice-no-profile';
import phoneVerificationVoiceThenSMSNoProfile from '../../../playground/mocks/data/idp/idx/authenticator-verification-data-phone-voice-then-sms-no-profile';
import smsVerificationNoProfile from '../../../playground/mocks/data/idp/idx/authenticator-verification-phone-sms-no-profile';
import voiceVerificationNoProfile from '../../../playground/mocks/data/idp/idx/authenticator-verification-phone-voice-no-profile';
import success from '../../../playground/mocks/data/idp/idx/success';
import invalidCode from '../../../playground/mocks/data/idp/idx/error-email-verify';

const phoneVerificationSMSThenVoiceEmptyProfile = JSON.parse(JSON.stringify(phoneVerificationSMSThenVoiceNoProfile));
// add empty profile to test
phoneVerificationSMSThenVoiceEmptyProfile.remediation.value[0].profile = {};

const phoneVerificationVoiceThenSMSEmptyProfile= JSON.parse(JSON.stringify(phoneVerificationVoiceThenSMSNoProfile));
// add empty profile to test
phoneVerificationVoiceThenSMSEmptyProfile.remediation.value[0].profile = {};

const smsVerificationEmptyProfile = JSON.parse(JSON.stringify(smsVerificationNoProfile));
// add empty profile to test
smsVerificationEmptyProfile.remediation.value[0].profile = {};

const voiceVerificationEmptyProfile = JSON.parse(JSON.stringify(voiceVerificationNoProfile));
// add empty profile to test
voiceVerificationEmptyProfile.remediation.value[0].profile = {};

const logger = RequestLogger(/challenge|challenge\/resend|challenge\/answer/,
  {
    logRequestBody: true,
    stringifyRequestBody: true,
  }
);

const smsPrimaryMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(phoneVerificationSMSThenVoice)
  .onRequestTo('http://localhost:3000/idp/idx/challenge')
  .respond(smsVerification)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/resend')
  .respond(smsVerification)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(success);

const voicePrimaryMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(phoneVerificationVoiceThenSMS)
  .onRequestTo('http://localhost:3000/idp/idx/challenge')
  .respond(voiceVerification)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(success);

const smsPrimaryMockNoProfile = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(phoneVerificationSMSThenVoiceNoProfile )
  .onRequestTo('http://localhost:3000/idp/idx/challenge')
  .respond(smsVerificationNoProfile )
  .onRequestTo('http://localhost:3000/idp/idx/challenge/resend')
  .respond(smsVerificationNoProfile )
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(success);

const voicePrimaryMockNoProfile  = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(phoneVerificationVoiceThenSMSNoProfile )
  .onRequestTo('http://localhost:3000/idp/idx/challenge')
  .respond(voiceVerificationNoProfile )
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(success);

const smsPrimaryMockEmptyProfile = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(phoneVerificationSMSThenVoiceEmptyProfile)
  .onRequestTo('http://localhost:3000/idp/idx/challenge')
  .respond(smsVerificationEmptyProfile)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/resend')
  .respond(smsVerificationEmptyProfile)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(success);

const voicePrimaryMockEmptyProfile = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(phoneVerificationVoiceThenSMSEmptyProfile)
  .onRequestTo('http://localhost:3000/idp/idx/challenge')
  .respond(voiceVerificationEmptyProfile)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(success);

const voiceOnlyMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(phoneVerificationVoiceOnly);

const invalidCodeMock = RequestMock()
  .onRequestTo('http://localhost:3000/idp/idx/introspect')
  .respond(smsVerification)
  .onRequestTo('http://localhost:3000/idp/idx/challenge/answer')
  .respond(invalidCode, 403);

fixture('Challenge Phone Form');

async function setup(t) {
  const challengePhonePageObject = new ChallengePhonePageObject(t);
  await challengePhonePageObject.navigateToPage();
  return challengePhonePageObject;
}

test
  .requestHooks(smsPrimaryMock)('SMS primary mode - has the right labels', async t => {
    const challengePhonePageObject = await setup(t);
    await checkConsoleMessages({
      controller: null,
      formName: 'authenticator-verification-data',
      authenticatorKey: 'phone_number',
      methodType: 'sms',
    });

    const pageTitle = challengePhonePageObject.getPageTitle();
    const pageSubtitle = challengePhonePageObject.getFormSubtitle();
    const primaryButtonText = challengePhonePageObject.getSaveButtonLabel();
    const secondaryButtonText = challengePhonePageObject.getSecondaryLinkText();
    await t.expect(pageTitle).contains('Verify with your phone');
    await t.expect(pageSubtitle).contains('Send a code via SMS to');
    await t.expect(pageSubtitle).contains('+1 XXX-XXX-2342');
    await t.expect(primaryButtonText).contains('Receive a code via SMS');
    await t.expect(secondaryButtonText).contains('Receive a voice call instead');

    await t.expect(await challengePhonePageObject.signoutLinkExists()).ok();
    await t.expect(challengePhonePageObject.getSignoutLinkText()).eql('Back to sign in');
  });

test
  .requestHooks(smsPrimaryMock)('SMS primary mode - can render with no sign-out link', async t => {
    const challengePhonePageObject = await setup(t);
    await renderWidget({
      features: { hideSignOutLinkInMFA: true },
    });

    await t.expect(challengePhonePageObject.getFormTitle()).contains('Verify with your phone');
    // signout link is not visible
    await t.expect(await challengePhonePageObject.signoutLinkExists()).notOk();
  });

test
  .requestHooks(logger, smsPrimaryMock)('SMS primary mode - Secondary button click', async t => {
    const challengePhonePageObject = await setup(t);
    await challengePhonePageObject.clickSecondaryLink();
    await t.expect(logger.count(() => true)).eql(1);
    const { request: { body, method, url } } = logger.requests[0];
    const methodTypeRequestBody = JSON.parse(body);
    await t.expect(methodTypeRequestBody).eql({
      authenticator: {
        id: 'autxl8PPhwHUpOpW60g3',
        methodType: 'voice',
      },
      stateHandle: 'eyJ6aXAiOiJERUYiLCJhbGlhcyI6ImVuY3J5cHRpb25rZXkiLCJ2ZXIiOiIxIiwib2lkIjoiMDBvdjRlUHM0eXFjT21TcDAwZzMiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiZGlyIn0..bxH8DK0q1wAeq1IN.chFU_FKuKTYWBelYcUQcyw_wtVsyGk8UfRSXs8aQuzDIugGFWYQ9QC8lxyu1ltTVOvHakB_Wy_qqYmQSTm7QIP716ZThSGaA1oYVwmePTy0Rozo8NBcYpyhsvHwqrwMbRYTW3CUROu4rH8r_wXhAoEuA82XZ7m3FVMy9xmeEGgiHOSmD-uh2tX0mdii2EKrhUAXxbH_1oF49Et0_zP6sv9CQuW5fmS2DCUETMTSiMYyUrGAqBORDdyJGljXn5qSUP_gmp7Bh96fGzYA2QxsEh4LQofSxaHtQwt-JbP2jppDsnY7d-MhZcOr16IIhmYJwt7RC0C1OyiUp32d0fElK58NgP7iF8UHGicCKiIvQfI3X4p1bVt_-aSZtmwA8GDOIw4f97kVkcT2fO9RUTJEEy5qIlIG6WlG9F8sboBx4b-K33RDsYtoYrv7ISqH2TM84ztw80KBNyfsVTN7_EzP8O_4aB03A8dZT08-dZv6Tj_6eBvEjTN9tmT6G3O3zSjgQTxeXyxEEZJiWAbwdWVCge4AT-EdDKwXUZYrwCp8y_FBOqTsh2woyw75Ll7SEmCSc5IAvh01TfnbSNc5WfXdr0AdJN3WsYIv6PiGTlIgkigWZC_uQovJHA6gUknfD3q7Jc-VT2XrGX_trbK_fLa8pHoI9Er2thqF4sYtHK136uNKKxXNpuOndUW8r2qKreFMWZz_7MZbjz1urBbAWrLzmeMjvhfFuI7BdhjIQzex0AhQ0pgMk_Epw2V0J6b81t-IkXgQSayX5KYReSgXgJGeNAP_WbhHstFQ5qFzZf11ZmrAMLBbBAUFZx28esaQoqCODFho5m2PVDx5giQm9J75-AtqYpdJyESyWY6CZlUefKqcts9dAjHkE7YHWGQ7icHFXFuc3SGt8ro5z8JV_wA6MgXuaFkk5uruz-VbiMqhBkdNoBi_qAljH2icXuqkMhgl3E96IApJzFWS1yGZl4CelULScf7wOrlgwcAHYGzu8R1QNjSWQD8bUBQBEFXEktIpFtk-tZrF0PfVvzuVZ2Yurxb7s6zRCAPhFpgq81klAxBp7QI6Pf8KLkbrtO2GNWSN1iBsQvVMYfXTY-djDpQ-8Izz5hdlapJYa6v1eGmToqb8-OTjhVYOUXzGK1A_pF0XLFjAGViJqux-XGZitKIYSXl-4vLa_ZM5H4qRKAttvlldCkLwGmFn9dwOPAliJHq42eaDtWlZU3FQdHQVNo8tLJcyugxAPWPJrnbKrKk3BxM-xRT657FFVeZLbCCkIuJhEkG-o-fHfa3tWCAVeDkbN9fXP17JXpxOrHsJ5yfNL6aJpJj77pyu_7Qq1s-qA2a60Cu9Bmfh-iC4nNZ_Z1EIG3fjxw9TQWwdUBDbOzBZ-nAt8p25XlduduVJyUMLzugPBriZRoUj1ZGJX9JWbuuptmoFKQ10XCx-3BJ3-REmpQltYE7LHCaHj0IR4XmIqBIdSUgsocQ5YbI_QtVUab_wrbzEIZARnbNSIOQPwP03kZU1KCDlmoh4y44jqIDy1QZA_squT8a3_9hYmc_jIekVwoDcb9NzoX_NIC0VdTaLP5NFGxiigGnKOF3IMHXgOEJoX3ESjK83uIwtbT8YyaHhI8ZGKnmqDV4nTSbPqyP58E6qcef1oOc4hcEnZVZl8O3QNa7z9QWbwfhXLNC6N2yNwqQ.GR_YTlIP0iEYJ2C7x3XQXg'
    });
    await t.expect(method).eql('post');
    await t.expect(url).eql('http://localhost:3000/idp/idx/challenge');
  });

test
  .requestHooks(voicePrimaryMock)('Voice primary mode - has the right labels', async t => {
    const challengePhonePageObject = await setup(t);

    await checkConsoleMessages({
      controller: null,
      formName: 'authenticator-verification-data',
      authenticatorKey: 'phone_number',
      methodType: 'voice',
    });

    const pageTitle = challengePhonePageObject.getPageTitle();
    const pageSubtitle = challengePhonePageObject.getFormSubtitle();
    const primaryButtonText = challengePhonePageObject.getSaveButtonLabel();
    const secondaryButtonText = challengePhonePageObject.getSecondaryLinkText();
    await t.expect(pageTitle).contains('Verify with your phone');
    await t.expect(pageSubtitle).contains('Send a code via voice call to');
    await t.expect(pageSubtitle).contains('+1 XXX-XXX-2342');
    await t.expect(primaryButtonText).contains('Receive a code via voice call');
    await t.expect(secondaryButtonText).contains('Receive an SMS instead');
  });

test
  .requestHooks(voiceOnlyMock)('Only one option - has only one primary button', async t => {
    const challengePhonePageObject = await setup(t);
    const pageTitle = challengePhonePageObject.getPageTitle();
    const pageSubtitle = challengePhonePageObject.getFormSubtitle();
    const primaryButtonText = challengePhonePageObject.getSaveButtonLabel();
    await t.expect(challengePhonePageObject.elementExists('.phone-authenticator-challenge__link')).notOk();
    await t.expect(pageTitle).contains('Verify with your phone');
    await t.expect(pageSubtitle).contains('Send a code via voice call to');
    await t.expect(pageSubtitle).contains('+1 XXX-XXX-2342');
    await t.expect(primaryButtonText).contains('Receive a code via voice call');
  });

test
  .requestHooks(logger, voicePrimaryMock)('Voice primary mode - Secondary button click', async t => {
    const challengePhonePageObject = await setup(t);
    await challengePhonePageObject.clickSecondaryLink();
    await t.expect(logger.count(() => true)).eql(1);
    const { request: { body, method, url } } = logger.requests[0];
    const methodTypeRequestBody = JSON.parse(body);
    await t.expect(methodTypeRequestBody).eql({
      authenticator: {
        id: 'autxl8PPhwHUpOpW60g3',
        methodType: 'sms',
      },
      stateHandle: 'eyJ6aXAiOiJERUYiLCJhbGlhcyI6ImVuY3J5cHRpb25rZXkiLCJ2ZXIiOiIxIiwib2lkIjoiMDBvdjRlUHM0eXFjT21TcDAwZzMiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiZGlyIn0..bxH8DK0q1wAeq1IN.chFU_FKuKTYWBelYcUQcyw_wtVsyGk8UfRSXs8aQuzDIugGFWYQ9QC8lxyu1ltTVOvHakB_Wy_qqYmQSTm7QIP716ZThSGaA1oYVwmePTy0Rozo8NBcYpyhsvHwqrwMbRYTW3CUROu4rH8r_wXhAoEuA82XZ7m3FVMy9xmeEGgiHOSmD-uh2tX0mdii2EKrhUAXxbH_1oF49Et0_zP6sv9CQuW5fmS2DCUETMTSiMYyUrGAqBORDdyJGljXn5qSUP_gmp7Bh96fGzYA2QxsEh4LQofSxaHtQwt-JbP2jppDsnY7d-MhZcOr16IIhmYJwt7RC0C1OyiUp32d0fElK58NgP7iF8UHGicCKiIvQfI3X4p1bVt_-aSZtmwA8GDOIw4f97kVkcT2fO9RUTJEEy5qIlIG6WlG9F8sboBx4b-K33RDsYtoYrv7ISqH2TM84ztw80KBNyfsVTN7_EzP8O_4aB03A8dZT08-dZv6Tj_6eBvEjTN9tmT6G3O3zSjgQTxeXyxEEZJiWAbwdWVCge4AT-EdDKwXUZYrwCp8y_FBOqTsh2woyw75Ll7SEmCSc5IAvh01TfnbSNc5WfXdr0AdJN3WsYIv6PiGTlIgkigWZC_uQovJHA6gUknfD3q7Jc-VT2XrGX_trbK_fLa8pHoI9Er2thqF4sYtHK136uNKKxXNpuOndUW8r2qKreFMWZz_7MZbjz1urBbAWrLzmeMjvhfFuI7BdhjIQzex0AhQ0pgMk_Epw2V0J6b81t-IkXgQSayX5KYReSgXgJGeNAP_WbhHstFQ5qFzZf11ZmrAMLBbBAUFZx28esaQoqCODFho5m2PVDx5giQm9J75-AtqYpdJyESyWY6CZlUefKqcts9dAjHkE7YHWGQ7icHFXFuc3SGt8ro5z8JV_wA6MgXuaFkk5uruz-VbiMqhBkdNoBi_qAljH2icXuqkMhgl3E96IApJzFWS1yGZl4CelULScf7wOrlgwcAHYGzu8R1QNjSWQD8bUBQBEFXEktIpFtk-tZrF0PfVvzuVZ2Yurxb7s6zRCAPhFpgq81klAxBp7QI6Pf8KLkbrtO2GNWSN1iBsQvVMYfXTY-djDpQ-8Izz5hdlapJYa6v1eGmToqb8-OTjhVYOUXzGK1A_pF0XLFjAGViJqux-XGZitKIYSXl-4vLa_ZM5H4qRKAttvlldCkLwGmFn9dwOPAliJHq42eaDtWlZU3FQdHQVNo8tLJcyugxAPWPJrnbKrKk3BxM-xRT657FFVeZLbCCkIuJhEkG-o-fHfa3tWCAVeDkbN9fXP17JXpxOrHsJ5yfNL6aJpJj77pyu_7Qq1s-qA2a60Cu9Bmfh-iC4nNZ_Z1EIG3fjxw9TQWwdUBDbOzBZ-nAt8p25XlduduVJyUMLzugPBriZRoUj1ZGJX9JWbuuptmoFKQ10XCx-3BJ3-REmpQltYE7LHCaHj0IR4XmIqBIdSUgsocQ5YbI_QtVUab_wrbzEIZARnbNSIOQPwP03kZU1KCDlmoh4y44jqIDy1QZA_squT8a3_9hYmc_jIekVwoDcb9NzoX_NIC0VdTaLP5NFGxiigGnKOF3IMHXgOEJoX3ESjK83uIwtbT8YyaHhI8ZGKnmqDV4nTSbPqyP58E6qcef1oOc4hcEnZVZl8O3QNa7z9QWbwfhXLNC6N2yNwqQ.GR_YTlIP0iEYJ2C7x3XQXg'
    });
    await t.expect(method).eql('post');
    await t.expect(url).eql('http://localhost:3000/idp/idx/challenge');
  });

test
  .requestHooks(smsPrimaryMock)('SMS mode - Enter code screen has the right labels', async t => {
    const challengePhonePageObject = await setup(t);
    await challengePhonePageObject.clickNextButton();

    const { log } = await t.getBrowserConsoleMessages();
    await t.expect(log.length).eql(5);
    await t.expect(log[0]).eql('===== playground widget ready event received =====');
    await t.expect(log[1]).eql('===== playground widget afterRender event received =====');
    await t.expect(JSON.parse(log[2])).eql({
      controller: null,
      formName: 'authenticator-verification-data',
      authenticatorKey: 'phone_number',
      methodType: 'sms',
    });
    await t.expect(log[3]).eql('===== playground widget afterRender event received =====');
    await t.expect(JSON.parse(log[4])).eql({
      controller: 'mfa-verify-passcode',
      formName: 'challenge-authenticator',
      authenticatorKey: 'phone_number',
      methodType: 'sms',
    });

    const pageSubtitle = challengePhonePageObject.getFormSubtitle();
    await t.expect(challengePhonePageObject.getSaveButtonLabel()).eql('Verify');
    await t.expect(pageSubtitle).contains('A code was sent to');
    await t.expect(pageSubtitle).contains('Enter the code below to verify.');
  });

test
  .requestHooks(voicePrimaryMock)('Voice mode - Enter code screen has the right labels', async t => {
    const challengePhonePageObject = await setup(t);
    await challengePhonePageObject.clickNextButton();

    const { log } = await t.getBrowserConsoleMessages();
    await t.expect(log.length).eql(5);
    await t.expect(log[0]).eql('===== playground widget ready event received =====');
    await t.expect(log[1]).eql('===== playground widget afterRender event received =====');
    await t.expect(JSON.parse(log[2])).eql({
      controller: null,
      formName: 'authenticator-verification-data',
      authenticatorKey: 'phone_number',
      methodType: 'voice',
    });
    await t.expect(log[3]).eql('===== playground widget afterRender event received =====');
    await t.expect(JSON.parse(log[4])).eql({
      controller: 'mfa-verify-passcode',
      formName: 'challenge-authenticator',
      authenticatorKey: 'phone_number',
      methodType: 'voice',
    });

    const pageSubtitle = challengePhonePageObject.getFormSubtitle();
    await t.expect(challengePhonePageObject.getSaveButtonLabel()).eql('Verify');
    await t.expect(pageSubtitle).contains('Calling');
    await t.expect(pageSubtitle).contains('Enter the code below to verify.');
  });

test
  .requestHooks(smsPrimaryMockNoProfile)('SMS views have the right labels when profile is null', async t => {
    const challengePhonePageObject = await setup(t);

    const pageTitle = challengePhonePageObject.getPageTitle();
    let pageSubtitle = challengePhonePageObject.getFormSubtitle();
    const primaryButtonText = challengePhonePageObject.getSaveButtonLabel();
    const secondaryButtonText = challengePhonePageObject.getSecondaryLinkText();
    await t.expect(pageTitle).contains('Verify with your phone');
    await t.expect(pageSubtitle).contains('Send a code via SMS to');
    await t.expect(pageSubtitle).contains('your phone');
    await t.expect(primaryButtonText).contains('Receive a code via SMS');
    await t.expect(secondaryButtonText).contains('Receive a voice call instead');

    await t.expect(await challengePhonePageObject.signoutLinkExists()).ok();
    await t.expect(challengePhonePageObject.getSignoutLinkText()).eql('Back to sign in');

    // enter code screen
    await challengePhonePageObject.clickNextButton();

    pageSubtitle = challengePhonePageObject.getFormSubtitle();
    await t.expect(challengePhonePageObject.getSaveButtonLabel()).eql('Verify');
    await t.expect(pageSubtitle).contains('A code was sent to');
    await t.expect(pageSubtitle).contains('your phone');
    await t.expect(pageSubtitle).contains('Enter the code below to verify.');
  });

test
  .requestHooks(voicePrimaryMockNoProfile)('Voice call views have the right labels when profile is null', async t => {
    const challengePhonePageObject = await setup(t);

    const pageTitle = challengePhonePageObject.getPageTitle();
    let pageSubtitle = challengePhonePageObject.getFormSubtitle();
    const primaryButtonText = challengePhonePageObject.getSaveButtonLabel();
    const secondaryButtonText = challengePhonePageObject.getSecondaryLinkText();
    await t.expect(pageTitle).contains('Verify with your phone');
    await t.expect(pageSubtitle).contains('Send a code via voice call to');
    await t.expect(pageSubtitle).contains('your phone');
    await t.expect(primaryButtonText).contains('Receive a code via voice call');
    await t.expect(secondaryButtonText).contains('Receive an SMS instead');

    await t.expect(await challengePhonePageObject.signoutLinkExists()).ok();
    await t.expect(challengePhonePageObject.getSignoutLinkText()).eql('Back to sign in');

    // enter code screen
    await challengePhonePageObject.clickNextButton();

    pageSubtitle = challengePhonePageObject.getFormSubtitle();
    await t.expect(challengePhonePageObject.getSaveButtonLabel()).eql('Verify');
    await t.expect(pageSubtitle).contains('Calling');
    await t.expect(pageSubtitle).contains('your phone');
    await t.expect(pageSubtitle).contains('Enter the code below to verify.');
  });

test
  .requestHooks(smsPrimaryMockEmptyProfile)('SMS views have the right labels when profile is empty', async t => {
    const challengePhonePageObject = await setup(t);

    const pageTitle = challengePhonePageObject.getPageTitle();
    let pageSubtitle = challengePhonePageObject.getFormSubtitle();
    const primaryButtonText = challengePhonePageObject.getSaveButtonLabel();
    const secondaryButtonText = challengePhonePageObject.getSecondaryLinkText();
    await t.expect(pageTitle).contains('Verify with your phone');
    await t.expect(pageSubtitle).contains('Send a code via SMS to');
    await t.expect(pageSubtitle).contains('your phone');
    await t.expect(primaryButtonText).contains('Receive a code via SMS');
    await t.expect(secondaryButtonText).contains('Receive a voice call instead');

    await t.expect(await challengePhonePageObject.signoutLinkExists()).ok();
    await t.expect(challengePhonePageObject.getSignoutLinkText()).eql('Back to sign in');

    // enter code screen
    await challengePhonePageObject.clickNextButton();

    pageSubtitle = challengePhonePageObject.getFormSubtitle();
    await t.expect(challengePhonePageObject.getSaveButtonLabel()).eql('Verify');
    await t.expect(pageSubtitle).contains('A code was sent to');
    await t.expect(pageSubtitle).contains('your phone');
    await t.expect(pageSubtitle).contains('Enter the code below to verify.');
  });

test
  .requestHooks(voicePrimaryMockEmptyProfile)('Voice call views have the right labels when profile is empty', async t => {
    const challengePhonePageObject = await setup(t);

    const pageTitle = challengePhonePageObject.getPageTitle();
    let pageSubtitle = challengePhonePageObject.getFormSubtitle();
    const primaryButtonText = challengePhonePageObject.getSaveButtonLabel();
    const secondaryButtonText = challengePhonePageObject.getSecondaryLinkText();
    await t.expect(pageTitle).contains('Verify with your phone');
    await t.expect(pageSubtitle).contains('Send a code via voice call to');
    await t.expect(pageSubtitle).contains('your phone');
    await t.expect(primaryButtonText).contains('Receive a code via voice call');
    await t.expect(secondaryButtonText).contains('Receive an SMS instead');

    await t.expect(await challengePhonePageObject.signoutLinkExists()).ok();
    await t.expect(challengePhonePageObject.getSignoutLinkText()).eql('Back to sign in');

    // enter code screen
    await challengePhonePageObject.clickNextButton();

    pageSubtitle = challengePhonePageObject.getFormSubtitle();
    await t.expect(challengePhonePageObject.getSaveButtonLabel()).eql('Verify');
    await t.expect(pageSubtitle).contains('Calling');
    await t.expect(pageSubtitle).contains('your phone');
    await t.expect(pageSubtitle).contains('Enter the code below to verify.');
  });

test
  .requestHooks(logger, smsPrimaryMock)('SMS flow', async t => {
    const challengePhonePageObject = await setup(t);
    await challengePhonePageObject.clickNextButton();

    await challengePhonePageObject.verifyFactor('credentials.passcode', '1234');
    await challengePhonePageObject.clickNextButton();

    const successPage = new SuccessPageObject(t);
    const pageUrl = await successPage.getPageUrl();
    await t.expect(pageUrl).eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
    await t.expect(logger.count(() => true)).eql(2);

    const [ methodTypeRequest, challengeCodeRequest ] = logger.requests;
    const methodTypeRequestBody = JSON.parse(methodTypeRequest.request.body);
    const challengeCodeRequestBody = JSON.parse(challengeCodeRequest.request.body);
    await t.expect(methodTypeRequestBody).eql({
      authenticator: {
        id: 'autxl8PPhwHUpOpW60g3',
        methodType: 'sms',
      },
      stateHandle: 'eyJ6aXAiOiJERUYiLCJhbGlhcyI6ImVuY3J5cHRpb25rZXkiLCJ2ZXIiOiIxIiwib2lkIjoiMDBvdjRlUHM0eXFjT21TcDAwZzMiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiZGlyIn0..bxH8DK0q1wAeq1IN.chFU_FKuKTYWBelYcUQcyw_wtVsyGk8UfRSXs8aQuzDIugGFWYQ9QC8lxyu1ltTVOvHakB_Wy_qqYmQSTm7QIP716ZThSGaA1oYVwmePTy0Rozo8NBcYpyhsvHwqrwMbRYTW3CUROu4rH8r_wXhAoEuA82XZ7m3FVMy9xmeEGgiHOSmD-uh2tX0mdii2EKrhUAXxbH_1oF49Et0_zP6sv9CQuW5fmS2DCUETMTSiMYyUrGAqBORDdyJGljXn5qSUP_gmp7Bh96fGzYA2QxsEh4LQofSxaHtQwt-JbP2jppDsnY7d-MhZcOr16IIhmYJwt7RC0C1OyiUp32d0fElK58NgP7iF8UHGicCKiIvQfI3X4p1bVt_-aSZtmwA8GDOIw4f97kVkcT2fO9RUTJEEy5qIlIG6WlG9F8sboBx4b-K33RDsYtoYrv7ISqH2TM84ztw80KBNyfsVTN7_EzP8O_4aB03A8dZT08-dZv6Tj_6eBvEjTN9tmT6G3O3zSjgQTxeXyxEEZJiWAbwdWVCge4AT-EdDKwXUZYrwCp8y_FBOqTsh2woyw75Ll7SEmCSc5IAvh01TfnbSNc5WfXdr0AdJN3WsYIv6PiGTlIgkigWZC_uQovJHA6gUknfD3q7Jc-VT2XrGX_trbK_fLa8pHoI9Er2thqF4sYtHK136uNKKxXNpuOndUW8r2qKreFMWZz_7MZbjz1urBbAWrLzmeMjvhfFuI7BdhjIQzex0AhQ0pgMk_Epw2V0J6b81t-IkXgQSayX5KYReSgXgJGeNAP_WbhHstFQ5qFzZf11ZmrAMLBbBAUFZx28esaQoqCODFho5m2PVDx5giQm9J75-AtqYpdJyESyWY6CZlUefKqcts9dAjHkE7YHWGQ7icHFXFuc3SGt8ro5z8JV_wA6MgXuaFkk5uruz-VbiMqhBkdNoBi_qAljH2icXuqkMhgl3E96IApJzFWS1yGZl4CelULScf7wOrlgwcAHYGzu8R1QNjSWQD8bUBQBEFXEktIpFtk-tZrF0PfVvzuVZ2Yurxb7s6zRCAPhFpgq81klAxBp7QI6Pf8KLkbrtO2GNWSN1iBsQvVMYfXTY-djDpQ-8Izz5hdlapJYa6v1eGmToqb8-OTjhVYOUXzGK1A_pF0XLFjAGViJqux-XGZitKIYSXl-4vLa_ZM5H4qRKAttvlldCkLwGmFn9dwOPAliJHq42eaDtWlZU3FQdHQVNo8tLJcyugxAPWPJrnbKrKk3BxM-xRT657FFVeZLbCCkIuJhEkG-o-fHfa3tWCAVeDkbN9fXP17JXpxOrHsJ5yfNL6aJpJj77pyu_7Qq1s-qA2a60Cu9Bmfh-iC4nNZ_Z1EIG3fjxw9TQWwdUBDbOzBZ-nAt8p25XlduduVJyUMLzugPBriZRoUj1ZGJX9JWbuuptmoFKQ10XCx-3BJ3-REmpQltYE7LHCaHj0IR4XmIqBIdSUgsocQ5YbI_QtVUab_wrbzEIZARnbNSIOQPwP03kZU1KCDlmoh4y44jqIDy1QZA_squT8a3_9hYmc_jIekVwoDcb9NzoX_NIC0VdTaLP5NFGxiigGnKOF3IMHXgOEJoX3ESjK83uIwtbT8YyaHhI8ZGKnmqDV4nTSbPqyP58E6qcef1oOc4hcEnZVZl8O3QNa7z9QWbwfhXLNC6N2yNwqQ.GR_YTlIP0iEYJ2C7x3XQXg'
    });
    await t.expect(methodTypeRequest.request.method).eql('post');
    await t.expect(methodTypeRequest.request.url).eql('http://localhost:3000/idp/idx/challenge');
    await t.expect(challengeCodeRequestBody).eql({
      credentials: { passcode: '1234' },
      stateHandle: 'eyJ6aXAiOiJERUYiLCJhbGlhcyI6ImVuY3J5cHRpb25rZXkiLCJ2ZXIiOiIxIiwib2lkIjoiMDBvdjRlUHM0eXFjT21TcDAwZzMiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiZGlyIn0..s7Gfs2YilflIYdKn.tkNBqIeHotu-kYbP9k9Fsj4faVeEc8eNlZKkbL2eBrzcqZ7M9Qm6RUOEjYEVQZncpnLiE96iEG10DV8oKTRpfoECkeuzIwi4Cbhmd7ZSePZO1i3bE4PW70ZkLcJjy2G46u4VWlGgC9bm2eRJjLh-lB3lCfS5fn-XYwFyDSsCZ2cJNtgCQzs_VIpEM6qnzMYxthNPcMcIhseAag3tK7RtKQJVqo-JpEfcieovoikacx_ZS4SaYj2yzycbAGr3Vh2ysvVZEMECM2mztj1OTVdgr9xnBPph5rcvDKkF00BjwOaDSHGwhJuFfzJ7rJXYCFOtDb0fUw57Ze6q-onb8_cBqGy6xm6iF_b4vRY4gBEp9G46tp5Hr_DrMOiX6nAWk9C6Hre7_4BIxX3GdjUqmhxuMV39renVBByAGevWaRpu4m3SR-mesxLzFPRTZYa333gjRkxVZNK2Gy68BLcLah15VH1jNVdV7Ou3nc9hzE9zcV2ueRZoSYq6h7WZ0KjLjhQTqRKe3g9XGR_DL05a26czfGJL-R1omHxUuFDlYSCd_jtKZE4TseUXQ5qfUzk0X9syqqVA36HEiJ5_CWsQ2SpxIgqir4DztivsQE1ubJfVrvPZw_-6GU391NkXE8e_B64X6ZSqgUgm5H4LuXj9Eu2VKG5z4KLKWieuHDK0Hjc1RRGuxFqcYhzySnTtK41Za4abTqVM-YYxokb9ah2yxauzpveIO0rDqjGo3kqZdVDV81kdvIzqgclooUb5X1o_fdmPjB_IUkVDkIHN9sVu1F0HkqQWp7xDmhbokAB7kVa6WIiax08UtTUfPvVK4aOLP_R61VfzImlTZ6otI6yC1yZAETauuADIz1YkB9bcBOOpJeqrom3keGeVwCmU-i0dJYGi1NLEPDm0px0OhVW77Cpi1C0aBX295Dju4-luOM3EuaBad-U5FMwDAO00qi0c3XDiaY0Bgkrmcqeo1yIl5p4cktsBs2ArzpzpEzJAmpLaIbuaihov8uy1K6e9y0Ko2VcOR930K-Cfnr-0QxX_WLtf8pB9LYENR2Gx65BxVMi9E4M1_rLG5UwBq4ATEH72a1kkTeXvDgMpwMmhIEz_nPuCcDJVZ8UDQoZU8C_T3yzOrlUHc8x2qN-FEWG3mLBGw7SAdxs3pH4eZnnQQVN4Ch4Tuc_wqMrophaxMLtWAt7Sa0L0zBpJUJsCKg_pTKH6gkjL_Tco6eIY7o78JoX7M_GSFIdF9qR3FLj9rXJrvP0qeWMrbhwgy6DhJg_bBWeKNQdclh1uRLLmbKpdCZH--lqLubZGJtd8JlkEKWW_PnDYFdDGzMwMz83owDHvw8GQ9KpqoPME-Ty0SEoMwKKdeRHCwUf90ycp7D5Jc6yHY17tr8axpjy_yCNhyI7ChtK0cnyJVsQPwkCH5q5fiiQrwX-nEny95PCpwnJzA85qGyYJusFlBO-HH8Ojcp_jTJNr3GeiBwfPQtOwQZ7AkUL7tLsls7q6MiLzCju_MGQlsFSzvV2N7wyFkCoLf9zyk7vKpU3QxfZFA6jqR-f9FOEXrWHr_0Orsd1s2k-RZ8_-SicRI5VieZj7YApi6v0LHqklqkzluwOfH-wSI4tf0En-A-rrR-1yQei7JCa0s8YXpp0mVOE.EC3UkB3_VQpE75Jet9kM4g'
    });
    await t.expect(challengeCodeRequest.request.method).eql('post');
    await t.expect(challengeCodeRequest.request.url).eql('http://localhost:3000/idp/idx/challenge/answer');
  });

test
  .requestHooks(logger, voicePrimaryMock)('Voice flow', async t => {
    const challengePhonePageObject = await setup(t);
    await challengePhonePageObject.clickNextButton();

    await challengePhonePageObject.verifyFactor('credentials.passcode', '1234');
    await challengePhonePageObject.clickNextButton();

    const successPage = new SuccessPageObject(t);
    const pageUrl = await successPage.getPageUrl();
    await t.expect(pageUrl).eql('http://localhost:3000/app/UserHome?stateToken=mockedStateToken123');
    await t.expect(logger.count(() => true)).eql(2);

    const [ methodTypeRequest, challengeCodeRequest ] = logger.requests;
    const methodTypeRequestBody = JSON.parse(methodTypeRequest.request.body);
    const challengeCodeRequestBody = JSON.parse(challengeCodeRequest.request.body);
    await t.expect(methodTypeRequestBody).eql({
      authenticator: {
        id: 'autxl8PPhwHUpOpW60g3',
        methodType: 'voice',
      },
      stateHandle: 'eyJ6aXAiOiJERUYiLCJhbGlhcyI6ImVuY3J5cHRpb25rZXkiLCJ2ZXIiOiIxIiwib2lkIjoiMDBvdjRlUHM0eXFjT21TcDAwZzMiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiZGlyIn0..bxH8DK0q1wAeq1IN.chFU_FKuKTYWBelYcUQcyw_wtVsyGk8UfRSXs8aQuzDIugGFWYQ9QC8lxyu1ltTVOvHakB_Wy_qqYmQSTm7QIP716ZThSGaA1oYVwmePTy0Rozo8NBcYpyhsvHwqrwMbRYTW3CUROu4rH8r_wXhAoEuA82XZ7m3FVMy9xmeEGgiHOSmD-uh2tX0mdii2EKrhUAXxbH_1oF49Et0_zP6sv9CQuW5fmS2DCUETMTSiMYyUrGAqBORDdyJGljXn5qSUP_gmp7Bh96fGzYA2QxsEh4LQofSxaHtQwt-JbP2jppDsnY7d-MhZcOr16IIhmYJwt7RC0C1OyiUp32d0fElK58NgP7iF8UHGicCKiIvQfI3X4p1bVt_-aSZtmwA8GDOIw4f97kVkcT2fO9RUTJEEy5qIlIG6WlG9F8sboBx4b-K33RDsYtoYrv7ISqH2TM84ztw80KBNyfsVTN7_EzP8O_4aB03A8dZT08-dZv6Tj_6eBvEjTN9tmT6G3O3zSjgQTxeXyxEEZJiWAbwdWVCge4AT-EdDKwXUZYrwCp8y_FBOqTsh2woyw75Ll7SEmCSc5IAvh01TfnbSNc5WfXdr0AdJN3WsYIv6PiGTlIgkigWZC_uQovJHA6gUknfD3q7Jc-VT2XrGX_trbK_fLa8pHoI9Er2thqF4sYtHK136uNKKxXNpuOndUW8r2qKreFMWZz_7MZbjz1urBbAWrLzmeMjvhfFuI7BdhjIQzex0AhQ0pgMk_Epw2V0J6b81t-IkXgQSayX5KYReSgXgJGeNAP_WbhHstFQ5qFzZf11ZmrAMLBbBAUFZx28esaQoqCODFho5m2PVDx5giQm9J75-AtqYpdJyESyWY6CZlUefKqcts9dAjHkE7YHWGQ7icHFXFuc3SGt8ro5z8JV_wA6MgXuaFkk5uruz-VbiMqhBkdNoBi_qAljH2icXuqkMhgl3E96IApJzFWS1yGZl4CelULScf7wOrlgwcAHYGzu8R1QNjSWQD8bUBQBEFXEktIpFtk-tZrF0PfVvzuVZ2Yurxb7s6zRCAPhFpgq81klAxBp7QI6Pf8KLkbrtO2GNWSN1iBsQvVMYfXTY-djDpQ-8Izz5hdlapJYa6v1eGmToqb8-OTjhVYOUXzGK1A_pF0XLFjAGViJqux-XGZitKIYSXl-4vLa_ZM5H4qRKAttvlldCkLwGmFn9dwOPAliJHq42eaDtWlZU3FQdHQVNo8tLJcyugxAPWPJrnbKrKk3BxM-xRT657FFVeZLbCCkIuJhEkG-o-fHfa3tWCAVeDkbN9fXP17JXpxOrHsJ5yfNL6aJpJj77pyu_7Qq1s-qA2a60Cu9Bmfh-iC4nNZ_Z1EIG3fjxw9TQWwdUBDbOzBZ-nAt8p25XlduduVJyUMLzugPBriZRoUj1ZGJX9JWbuuptmoFKQ10XCx-3BJ3-REmpQltYE7LHCaHj0IR4XmIqBIdSUgsocQ5YbI_QtVUab_wrbzEIZARnbNSIOQPwP03kZU1KCDlmoh4y44jqIDy1QZA_squT8a3_9hYmc_jIekVwoDcb9NzoX_NIC0VdTaLP5NFGxiigGnKOF3IMHXgOEJoX3ESjK83uIwtbT8YyaHhI8ZGKnmqDV4nTSbPqyP58E6qcef1oOc4hcEnZVZl8O3QNa7z9QWbwfhXLNC6N2yNwqQ.GR_YTlIP0iEYJ2C7x3XQXg'
    });
    await t.expect(methodTypeRequest.request.method).eql('post');
    await t.expect(methodTypeRequest.request.url).eql('http://localhost:3000/idp/idx/challenge');
    await t.expect(challengeCodeRequestBody).eql({
      credentials: { passcode: '1234' },
      stateHandle: 'eyJ6aXAiOiJERUYiLCJhbGlhcyI6ImVuY3J5cHRpb25rZXkiLCJ2ZXIiOiIxIiwib2lkIjoiMDBvdjRlUHM0eXFjT21TcDAwZzMiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiZGlyIn0..s7Gfs2YilflIYdKn.tkNBqIeHotu-kYbP9k9Fsj4faVeEc8eNlZKkbL2eBrzcqZ7M9Qm6RUOEjYEVQZncpnLiE96iEG10DV8oKTRpfoECkeuzIwi4Cbhmd7ZSePZO1i3bE4PW70ZkLcJjy2G46u4VWlGgC9bm2eRJjLh-lB3lCfS5fn-XYwFyDSsCZ2cJNtgCQzs_VIpEM6qnzMYxthNPcMcIhseAag3tK7RtKQJVqo-JpEfcieovoikacx_ZS4SaYj2yzycbAGr3Vh2ysvVZEMECM2mztj1OTVdgr9xnBPph5rcvDKkF00BjwOaDSHGwhJuFfzJ7rJXYCFOtDb0fUw57Ze6q-onb8_cBqGy6xm6iF_b4vRY4gBEp9G46tp5Hr_DrMOiX6nAWk9C6Hre7_4BIxX3GdjUqmhxuMV39renVBByAGevWaRpu4m3SR-mesxLzFPRTZYa333gjRkxVZNK2Gy68BLcLah15VH1jNVdV7Ou3nc9hzE9zcV2ueRZoSYq6h7WZ0KjLjhQTqRKe3g9XGR_DL05a26czfGJL-R1omHxUuFDlYSCd_jtKZE4TseUXQ5qfUzk0X9syqqVA36HEiJ5_CWsQ2SpxIgqir4DztivsQE1ubJfVrvPZw_-6GU391NkXE8e_B64X6ZSqgUgm5H4LuXj9Eu2VKG5z4KLKWieuHDK0Hjc1RRGuxFqcYhzySnTtK41Za4abTqVM-YYxokb9ah2yxauzpveIO0rDqjGo3kqZdVDV81kdvIzqgclooUb5X1o_fdmPjB_IUkVDkIHN9sVu1F0HkqQWp7xDmhbokAB7kVa6WIiax08UtTUfPvVK4aOLP_R61VfzImlTZ6otI6yC1yZAETauuADIz1YkB9bcBOOpJeqrom3keGeVwCmU-i0dJYGi1NLEPDm0px0OhVW77Cpi1C0aBX295Dju4-luOM3EuaBad-U5FMwDAO00qi0c3XDiaY0Bgkrmcqeo1yIl5p4cktsBs2ArzpzpEzJAmpLaIbuaihov8uy1K6e9y0Ko2VcOR930K-Cfnr-0QxX_WLtf8pB9LYENR2Gx65BxVMi9E4M1_rLG5UwBq4ATEH72a1kkTeXvDgMpwMmhIEz_nPuCcDJVZ8UDQoZU8C_T3yzOrlUHc8x2qN-FEWG3mLBGw7SAdxs3pH4eZnnQQVN4Ch4Tuc_wqMrophaxMLtWAt7Sa0L0zBpJUJsCKg_pTKH6gkjL_Tco6eIY7o78JoX7M_GSFIdF9qR3FLj9rXJrvP0qeWMrbhwgy6DhJg_bBWeKNQdclh1uRLLmbKpdCZH--lqLubZGJtd8JlkEKWW_PnDYFdDGzMwMz83owDHvw8GQ9KpqoPME-Ty0SEoMwKKdeRHCwUf90ycp7D5Jc6yHY17tr8axpjy_yCNhyI7ChtK0cnyJVsQPwkCH5q5fiiQrwX-nEny95PCpwnJzA85qGyYJusFlBO-HH8Ojcp_jTJNr3GeiBwfPQtOwQZ7AkUL7tLsls7q6MiLzCju_MGQlsFSzvV2N7wyFkCoLf9zyk7vKpU3QxfZFA6jqR-f9FOEXrWHr_0Orsd1s2k-RZ8_-SicRI5VieZj7YApi6v0LHqklqkzluwOfH-wSI4tf0En-A-rrR-1yQei7JCa0s8YXpp0mVOE.EC3UkB3_VQpE75Jet9kM4g'
    });
    await t.expect(challengeCodeRequest.request.method).eql('post');
    await t.expect(challengeCodeRequest.request.url).eql('http://localhost:3000/idp/idx/challenge/answer');
  });

test
  .requestHooks(invalidCodeMock)('Entering invalid passcode results in an error', async t => {
    const challengePhonePageObject = await setup(t);
    await challengePhonePageObject.verifyFactor('credentials.passcode', 'abcd');
    await challengePhonePageObject.clickNextButton();
    await challengePhonePageObject.waitForErrorBox();
    await t.expect(challengePhonePageObject.getInvalidOTPError()).contains('You do not have permission to perform the requested action');
  });

test
  .requestHooks(logger, smsPrimaryMock)(`Callout appears after 30 seconds in sms mode
  - enter code screen`, async t => {
    const challengePhonePageObject = await setup(t);
    await challengePhonePageObject.clickNextButton();
    await t.expect(challengePhonePageObject.resendEmailView().hasClass('hide')).ok();
    await t.wait(30500);
    await t.expect(challengePhonePageObject.resendEmailView().hasClass('hide')).notOk();
    const resendEmailView = challengePhonePageObject.resendEmailView();
    await t.expect(resendEmailView.innerText).eql('Haven\'t received an SMS? Send again');
  });

test
  .requestHooks(voicePrimaryMock)(`Callout appears after 30 seconds in voice mode
  - enter code screen`, async t => {
    const challengePhonePageObject = await setup(t);
    await challengePhonePageObject.clickNextButton();
    await t.expect(challengePhonePageObject.resendEmailView().hasClass('hide')).ok();
    await t.wait(30500);
    await t.expect(challengePhonePageObject.resendEmailView().hasClass('hide')).notOk();
    const resendEmailView = challengePhonePageObject.resendEmailView();
    await t.expect(resendEmailView.innerText).eql('Haven\'t received a call? Call again');
  });
