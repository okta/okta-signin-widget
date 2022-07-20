/*
 * Copyright (c) 2022-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

/* eslint-disable testcafe-community/expectExpect */

import { Selector } from 'testcafe';
import { checkA11y } from '../util/A11y';

async function takeScreenshot(t: TestController, name: string) {
  if (process.env.CI) {
    return;
  }
  await t.takeScreenshot(name);
}

fixture('Check A11y');

test.page(
  'http://localhost:3000/?siw-use-mocks=true&siw-mock-response=/idp/idx/introspect/default',
)('identify-with-password', async (t) => {
  await checkA11y(t);
  takeScreenshot(t, 'identify-with-password');
});

test.page(
  'http://localhost:3000/?siw-use-mocks=true&siw-mock-response=/idp/idx/identify/securityquestion-verify',
)('authenticator-verification-security-question', async (t) => {
  await checkA11y(t);
  await takeScreenshot(t, 'authenticator-verification-security-question');
});

test.page(
  'http://localhost:3000/?siw-use-mocks=true&siw-mock-response=/idp/idx/challenge/sms-challenge',
)('authenticator-verification-phone-sms', async (t) => {
  await checkA11y(t);
  await takeScreenshot(t, 'authenticator-verification-phone-sms');
});

test.page(
  'http://localhost:3000/?siw-use-mocks=true&siw-mock-response=/idp/idx/challenge/sms-method',
)('authenticator-verification-data-phone-sms-only', async (t) => {
  await checkA11y(t);
  await takeScreenshot(t, 'authenticator-verification-data-phone-sms-only');
});

test.page(
  'http://localhost:3000/?siw-use-mocks=true&siw-mock-response=/idp/idx/challenge/default',
)('authenticator-verification-email', async (t) => {
  await checkA11y(t);
  await takeScreenshot(t, 'authenticator-verification-email-step1');

  await t
    .click(Selector('button').withExactText('Enter a code from the email instead'));

  await checkA11y(t);
  await takeScreenshot(t, 'authenticator-verification-email-step2');
});

test.page(
  'http://localhost:3000/?siw-use-mocks=true&siw-mock-response=/idp/idx/challenge/error-401-invalid-otp-passcode',
)('error-401-invalid-otp-passcode', async (t) => {
  await t
    .click(Selector('button').withExactText('Enter a code from the email instead'));

  await checkA11y(t);
  await takeScreenshot(t, 'error-401-invalid-otp-passcode');
});

test.page(
  'http://localhost:3000/?siw-use-mocks=true&siw-mock-response=/idp/idx/identify/google-auth-verify',
)('authenticator-verification-google-authenticator', async (t) => {
  await checkA11y(t);
  await takeScreenshot(t, 'authenticator-verification-google-authenticator');
});

test.page(
  'http://localhost:3000/?siw-use-mocks=true&siw-mock-response=/idp/idx/introspect/terminal-return-email',
)('terminal-return-email', async (t) => {
  await checkA11y(t);
  await takeScreenshot(t, 'terminal-return-email');
});

test.page(
  'http://localhost:3000/?siw-use-mocks=true&siw-mock-response=/idp/idx/introspect/email-challenge-consent',
)('email-challenge-consent', async (t) => {
  await checkA11y(t);
  await takeScreenshot(t, 'email-challenge-consent');
});

test.page(
  'http://localhost:3000/?siw-use-mocks=true&siw-mock-response=/idp/idx/credential/enroll/webauthn-enroll-mfa',
)('webauthn-enroll', async (t) => {
  await checkA11y(t);
  await takeScreenshot(t, 'webauthn-enroll');
});

test.page(
  'http://localhost:3000/?siw-use-mocks=true&siw-mock-response=/idp/idx/enroll/default',
)('enroll-profile', async (t) => {
  await checkA11y(t);
  await takeScreenshot(t, 'enroll-profile');
});

test.page(
  'http://localhost:3000/?siw-use-mocks=true&siw-mock-response=/oauth2/default/v1/interact/error-feature-not-enabled',
)('error-feature-not-enabled', async (t) => {
  await checkA11y(t);
  await takeScreenshot(t, 'error-feature-not-enabled');
});

test.page(
  'http://localhost:3000/?siw-use-mocks=true&siw-mock-response=/idp/idx/credential/enroll/enroll-okta-verify-mfa',
)('okta-verify-poll-enrollment', async (t) => {
  await checkA11y(t);
  await takeScreenshot(t, 'okta-verify-poll-enrollment');
});

test.page(
  'http://localhost:3000/?siw-use-mocks=true&siw-mock-response=/idp/idx/credential/enroll/enroll-ov-email-channel',
)('okta-verify-email-channel-enrollment', async (t) => {
  await checkA11y(t);
  await takeScreenshot(t, 'okta-verify-email-channel-enrollment');
});

test.page(
  'http://localhost:3000/?siw-use-mocks=true&siw-mock-response=/idp/idx/credential/enroll/enroll-ov-sms-channel',
)('okta-verify-sms-channel-enrollment', async (t) => {
  await checkA11y(t);
  await takeScreenshot(t, 'okta-verify-sms-channel-enrollment');
});

test.page(
  'http://localhost:3000/?siw-use-mocks=true&siw-mock-response=/idp/idx/credential/enroll/enroll-ov-qr-version-upgrade',
)('okta-verify-enrollment-version-upgrade', async (t) => {
  await checkA11y(t);
  await takeScreenshot(t, 'okta-verify-enrollment-version-upgrade');
});

test.page(
  'http://localhost:3000/?siw-use-mocks=true&siw-mock-response=/idp/idx/enroll/new/error-account-creation',
)('error-account-creation', async (t) => {
  await checkA11y(t);
  await takeScreenshot(t, 'error-account-creation');
});

test.page(
  'http://localhost:3000/?siw-use-mocks=true&siw-mock-response=/oauth2/default/v1/interact/error-recovery-token-invalid',
)('error-recovery-token-invalid', async (t) => {
  await checkA11y(t);
  await takeScreenshot(t, 'error-recovery-token-invalid');
});

test.page(
  'http://localhost:3000/?siw-use-mocks=true&siw-mock-response=/oauth2/default/v1/interact/error-400-unauthorized-client',
)('error-400-unauthorized-client', async (t) => {
  await checkA11y(t);
  await takeScreenshot(t, 'error-400-unauthorized-client');
});

test.page(
  'http://localhost:3000/?siw-use-mocks=true&siw-mock-response=/idp/idx/introspect/terminal-return-email-error',
)('terminal-return-email-error', async (t) => {
  await checkA11y(t);
  await takeScreenshot(t, 'terminal-return-email-error');
});

test.page(
  'http://localhost:3000/?siw-use-mocks=true&siw-mock-response=/idp/idx/introspect/terminal-return-otp-only-full-location-enrollment',
)('terminal-return-otp-only-full-location-enrollment', async (t) => {
  await checkA11y(t);
  await takeScreenshot(t, 'terminal-return-otp-only-full-location-enrollment');
});

test.page(
  'http://localhost:3000/?siw-use-mocks=true&siw-mock-response=/idp/idx/introspect/terminal-return-otp-only-full-location-recovery',
)('terminal-return-otp-only-full-location-recovery', async (t) => {
  await checkA11y(t);
  await takeScreenshot(t, 'terminal-return-otp-only-full-location-recovery');
});

test.page(
  'http://localhost:3000/?siw-use-mocks=true&siw-mock-response=/idp/idx/introspect/terminal-return-otp-only-full-location-unlock',
)('terminal-return-otp-only-full-location-unlock', async (t) => {
  await checkA11y(t);
  await takeScreenshot(t, 'terminal-return-otp-only-full-location-unlock');
});

test.page(
  'http://localhost:3000/?siw-use-mocks=true&siw-mock-response=/idp/idx/introspect/terminal-return-otp-only-full-location',
)('terminal-return-otp-only-full-location', async (t) => {
  await checkA11y(t);
  await takeScreenshot(t, 'terminal-return-otp-only-full-location');
});

test.page(
  'http://localhost:3000/?siw-use-mocks=true&siw-mock-response=/idp/idx/introspect/terminal-return-otp-only-no-location',
)('terminal-return-otp-only-no-location', async (t) => {
  await checkA11y(t);
  await takeScreenshot(t, 'terminal-return-otp-only-no-location');
});

test.page(
  'http://localhost:3000/?siw-use-mocks=true&siw-mock-response=/idp/idx/introspect/terminal-return-otp-only-partial-location',
)('terminal-return-otp-only-partial-location', async (t) => {
  await checkA11y(t);
  await takeScreenshot(t, 'terminal-return-otp-only-partial-location');
});

test.page(
  'http://localhost:3000/?siw-use-mocks=true&siw-mock-response=/idp/idx/credential/enroll/securityquestion-enroll-mfa',
)('authenticator-enroll-security-question', async (t) => {
  await checkA11y(t);
  await takeScreenshot(t, 'authenticator-enroll-security-question');
});

test.page(
  'http://localhost:3000/?siw-use-mocks=true&siw-mock-response=/idp/idx/identify/authenticator-expired-password',
)('authenticator-expired-password', async (t) => {
  await checkA11y(t);
  await takeScreenshot(t, 'authenticator-expired-password');
});

test.page(
  'http://localhost:3000/?siw-use-mocks=true&siw-mock-response=/idp/idx/identify/authenticator-expiry-warning-password',
)('authenticator-expiry-warning-password', async (t) => {
  await checkA11y(t);
  await takeScreenshot(t, 'authenticator-expiry-warning-password');
});

test.page(
  'http://localhost:3000/?siw-use-mocks=true&siw-mock-response=/idp/idx/identify/authenticator-expired-password-with-enrollment-authenticator',
)('authenticator-expired-password-with-enrollment-authenticator', async (t) => {
  await checkA11y(t);
  await takeScreenshot(t, 'authenticator-expired-password-with-enrollment-authenticator');
});

test.page(
  'http://localhost:3000/?siw-use-mocks=true&siw-mock-response=/idp/idx/identify/authenticator-expired-password-no-complexity',
)('authenticator-expired-password-no-complexity', async (t) => {
  await checkA11y(t);
  await takeScreenshot(t, 'authenticator-expired-password-no-complexity');
});

test.page(
  'http://localhost:3000/?siw-use-mocks=true&siw-mock-response=/idp/idx/unlock-account/default',
)('user-unlock-account', async (t) => {
  await checkA11y(t);
  await takeScreenshot(t, 'user-unlock-account');
});

test.page(
  'http://localhost:3000/?siw-use-mocks=true&siw-mock-response=/idp/idx/challenge/answer/unlock-account-success',
)('unlock-account-success', async (t) => {
  await checkA11y(t);
  await takeScreenshot(t, 'unlock-account-success');
});

test.page(
  'http://localhost:3000/?siw-use-mocks=true&siw-mock-response=/idp/idx/challenge/verify-ov-code-mfa',
)('authenticator-verification-okta-verify-totp', async (t) => {
  await checkA11y(t);
  await takeScreenshot(t, 'authenticator-verification-okta-verify-totp');
});

test.page(
  'http://localhost:3000/?siw-use-mocks=true&siw-mock-response=/idp/idx/challenge/verify-ov-push-method',
)('authenticator-verification-okta-verify-push', async (t) => {
  await checkA11y(t);
  await takeScreenshot(t, 'authenticator-verification-okta-verify-push');
});

test.page(
  'http://localhost:3000/?siw-use-mocks=true&siw-mock-response=/idp/idx/challenge/verify-ov-send-push',
)('authenticator-verification-okta-verify-push-poll', async (t) => {
  await checkA11y(t);
  await takeScreenshot(t, 'authenticator-verification-okta-verify-push-poll');
});

test.page(
  'http://localhost:3000/?siw-use-mocks=true&siw-mock-response=/idp/idx/challenge/verify-ov-push-manual',
)('authenticator-verification-okta-verify-push-code', async (t) => {
  await checkA11y(t);
  await takeScreenshot(t, 'authenticator-verification-okta-verify-push-code');
});

test.page(
  'http://localhost:3000/?siw-use-mocks=true&siw-mock-response=/idp/idx/authenticator-enroll-select-authenticator',
)('authenticator-enroll-select-authenticator', async (t) => {
  await checkA11y(t);
  await takeScreenshot(t, 'authenticator-enroll-select-authenticator');
});

test.page(
  'http://localhost:3000/?siw-use-mocks=true&siw-mock-response=/idp/idx/authenticator-enroll-select-authenticator-with-skip',
)('authenticator-enroll-select-authenticator-with-skip', async (t) => {
  await checkA11y(t);
  await takeScreenshot(t, 'authenticator-enroll-select-authenticator-with-skip');
});

test.page(
  'http://localhost:3000/?siw-use-mocks=true&siw-mock-response=/idp/idx/authenticator-verification-select-authenticator',
)('authenticator-verification-select-authenticator', async (t) => {
  // TODO: images contain the same labelledBy value when duplicate authenticators exist in the response
  // await checkA11y(t);
  await takeScreenshot(t, 'authenticator-verification-select-authenticator');
});

test.page(
  'http://localhost:3000/?siw-use-mocks=true&siw-mock-response=/idp/idx/credential/enroll/google-auth-scan-enroll',
)('authenticator-enroll-google-authenticator', async (t) => {
  await checkA11y(t);
  await takeScreenshot(t, 'authenticator-enroll-google-authenticator-qrcode');

  await t
    .click(Selector('button').withExactText('Set up a different way'));

  await checkA11y(t);
  await takeScreenshot(t, 'authenticator-enroll-google-authenticator-secret-key');

  await t
    .click(Selector('button').withExactText('Next'));

  await checkA11y(t);
  await takeScreenshot(t, 'authenticator-enroll-google-authenticator-challenge');
});

test.page(
  'http://localhost:3000/?siw-use-mocks=true&siw-mock-response=/idp/idx/credential/enroll/enroll-phone-voice-sms-mfa',
)('authenticator-enroll-data-phone', async (t) => {
  await checkA11y(t);
  await takeScreenshot(t, 'authenticator-enroll-data-phone');
});

test.page(
  'http://localhost:3000/?siw-use-mocks=true&siw-mock-response=/idp/idx/credential/enroll/enroll-phone-sms-code-mfa',
)('authenticator-enroll-phone-sms', async (t) => {
  await checkA11y(t);
  await takeScreenshot(t, 'authenticator-enroll-phone-sms');
});

test.page(
  'http://localhost:3000/?siw-use-mocks=true&siw-mock-response=/idp/idx/credential/enroll/enroll-phone-voice-code-mfa',
)('authenticator-enroll-phone-voice', async (t) => {
  await checkA11y(t);
  await takeScreenshot(t, 'authenticator-enroll-phone-voice');
});

test.page(
  'http://localhost:3000/?siw-use-mocks=true&siw-mock-response=/idp/idx/identify/password-reset',
)('authenticator-email-verification-data', async (t) => {
  await checkA11y(t);
  await takeScreenshot(t, 'authenticator-email-verification-data');
});

test.page(
  'http://localhost:3000/?siw-use-mocks=true&siw-mock-response=/idp/idx/challenge/answer/password-reset',
)('authenticator-reset-password', async (t) => {
  await checkA11y(t);
  await takeScreenshot(t, 'authenticator-reset-password');
});

test.page(
  'http://localhost:8080/?siw-use-mocks=true&siw-mock-response=/idp/idx/identify/error-session-expired',
)('error-session-expired', async (t) => {
  await checkA11y(t);
  await takeScreenshot(t, 'error-session-expired');
});
