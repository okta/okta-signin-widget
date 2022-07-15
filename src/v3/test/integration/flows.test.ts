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

import fs from 'fs';

let tests: string[];
beforeAll(() => {
  const testSuffix = '.test.tsx';
  tests = fs.readdirSync(__dirname)
    .filter((file) => file.endsWith(testSuffix))
    .map((file) => file.replace(testSuffix, ''));
});

describe('flows', () => {
  it('covers auth-securityquestion flow', () => {
    [
      'identify-with-password',
      'authenticator-verification-security-question',
    ].forEach((test) => {
      expect(tests.includes(test)).toBeTruthy();
    });
  });

  it('covers authenticator-verification-phone-sms flow', () => {
    [
      'identify-with-password',
      'authenticator-verification-select-authenticator',
      'authenticator-verification-data-phone-sms-only',
      'authenticator-verification-phone-sms',
    ].forEach((test) => {
      expect(tests.includes(test)).toBeTruthy();
    });
  });

  it('covers authenticator-verification-email flow', () => {
    [
      'identify-with-password',
      'authenticator-verification-select-authenticator',
      'authenticator-verification-email',
    ].forEach((test) => {
      expect(tests.includes(test)).toBeTruthy();
    });
  });

  it('covers authenticator-verification-google-authenticator flow', () => {
    [
      'identify-with-password',
      'authenticator-verification-google-authenticator',
    ].forEach((test) => {
      expect(tests.includes(test)).toBeTruthy();
    });
  });

  it('covers email-challenge-consent flow', () => {
    [
      'email-challenge-consent',
      'terminal-return-email',
    ].forEach((test) => {
      expect(tests.includes(test)).toBeTruthy();
    });
  });

  it('covers webauthn-enroll flow', () => {
    [
      'identify-with-password',
      'authenticator-enroll-select-authenticator',
      'webauthn-enroll',
    ].forEach((test) => {
      expect(tests.includes(test)).toBeTruthy();
    });
  });

  it('covers enroll-profile flow', () => {
    [
      'enroll-profile',
      'authenticator-enroll-select-authenticator',
    ].forEach((test) => {
      expect(tests.includes(test)).toBeTruthy();
    });
  });

  it('covers okta-verify-enroll flow', () => {
    [
      'flow-okta-verify-enrollment',
    ].forEach((test) => {
      expect(tests.includes(test)).toBeTruthy();
    });
  });

  it('covers ov-enrollment-requiring-version-upgrade flow', () => {
    [
      'identify-with-password',
      'authenticator-verification-google-authenticator',
      'authenticator-enroll-select-authenticator',
      'okta-verify-enrollment-version-upgrade',
    ].forEach((test) => {
      expect(tests.includes(test)).toBeTruthy();
    });
  });

  it('covers authenticator-enroll-security-question flow', () => {
    [
      'identify-with-password',
      'authenticator-enroll-select-authenticator',
      'authenticator-enroll-security-question',
    ].forEach((test) => {
      expect(tests.includes(test)).toBeTruthy();
    });
  });

  it('covers authenticator-expired-password flow', () => {
    [
      'identify-with-password',
      'authenticator-expired-password',
      'authenticator-verification-select-authenticator',
    ].forEach((test) => {
      expect(tests.includes(test)).toBeTruthy();
    });
  });

  it('covers authenticator-expiry-warning-password flow', () => {
    [
      'identify-with-password',
      'authenticator-expiry-warning-password',
      'authenticator-verification-select-authenticator',
    ].forEach((test) => {
      expect(tests.includes(test)).toBeTruthy();
    });
  });

  it('covers authenticator-expired-password-with-enrollment-authenticator flow', () => {
    [
      'identify-with-password',
      'authenticator-expired-password-with-enrollment-authenticator',
      'authenticator-verification-select-authenticator',
    ].forEach((test) => {
      expect(tests.includes(test)).toBeTruthy();
    });
  });

  it('covers authenticator-expired-password-no-complexity flow', () => {
    [
      'identify-with-password',
      'authenticator-expired-password-no-complexity',
      'authenticator-verification-select-authenticator',
    ].forEach((test) => {
      expect(tests.includes(test)).toBeTruthy();
    });
  });

  it('covers unlock-account-email-securityquestion flow', () => {
    [
      'flow-entry-payload',
      'user-unlock-account',
      'authenticator-verification-email',
      'authenticator-verification-security-question',
      'unlock-account-success',
    ].forEach((test) => {
      expect(tests.includes(test)).toBeTruthy();
    });
  });

  it('covers unlock-account-sms flow', () => {
    [
      'flow-entry-payload',
      'user-unlock-account',
      'authenticator-verification-phone-sms',
      'unlock-account-success',
    ].forEach((test) => {
      expect(tests.includes(test)).toBeTruthy();
    });
  });

  it('covers unlock-account-email-verify-with-ga flow', () => {
    [
      'flow-entry-payload',
      'user-unlock-account',
      'authenticator-verification-email',
      'authenticator-verification-google-authenticator',
      'unlock-account-success',
    ].forEach((test) => {
      expect(tests.includes(test)).toBeTruthy();
    });
  });

  it('covers unlock-account-email-verify-with-webauthn flow', () => {
    [
      'flow-entry-payload',
      'user-unlock-account',
      'authenticator-verification-email',
      'authenticator-verification-webauthn',
      'unlock-account-success',
    ].forEach((test) => {
      expect(tests.includes(test)).toBeTruthy();
    });
  });

  it('covers unlock-account-sms-verify-with-ga flow', () => {
    [
      'flow-entry-payload',
      'user-unlock-account',
      'authenticator-verification-phone-sms',
      'authenticator-verification-google-authenticator',
      'unlock-account-success',
    ].forEach((test) => {
      expect(tests.includes(test)).toBeTruthy();
    });
  });

  it('covers unlock-account-sms-verify-with-webauthn flow', () => {
    [
      'flow-entry-payload',
      'user-unlock-account',
      'authenticator-verification-phone-sms',
      'authenticator-verification-webauthn',
      'unlock-account-success',
    ].forEach((test) => {
      expect(tests.includes(test)).toBeTruthy();
    });
  });

  it('covers authenticator-verification-okta-verify-totp flow', () => {
    [
      'identify-with-password',
      'authenticator-verification-select-authenticator',
      'authenticator-verification-okta-verify-totp',
    ].forEach((test) => {
      expect(tests.includes(test)).toBeTruthy();
    });
  });

  it('covers authenticator-enroll-data-phone sms flow', () => {
    [
      'identify-with-password',
      'authenticator-enroll-select-authenticator',
      'authenticator-enroll-data-phone',
      'authenticator-enroll-phone-sms',
      'authenticator-verification-select-authenticator',
    ].forEach((test) => {
      expect(tests.includes(test)).toBeTruthy();
    });
  });

  it('covers authenticator-verification-okta-verify-push flow', () => {
    [
      'identify-with-password',
      'authenticator-verification-select-authenticator',
      'authenticator-verification-okta-verify-push',
      'authenticator-verification-okta-verify-push-poll',
    ].forEach((test) => {
      expect(tests.includes(test)).toBeTruthy();
    });
  });

  it('covers authenticator-verification-okta-verify-push-code flow', () => {
    [
      'identify-with-password',
      'authenticator-verification-select-authenticator',
      'authenticator-verification-okta-verify-push',
      'authenticator-verification-okta-verify-push-code',
    ].forEach((test) => {
      expect(tests.includes(test)).toBeTruthy();
    });
  });

  it('covers google-auth-scan-enroll flow', () => {
    [
      'identify-with-password',
      'authenticator-enroll-select-authenticator',
      'authenticator-enroll-google-authenticator',
    ].forEach((test) => {
      expect(tests.includes(test)).toBeTruthy();
    });
  });

  it('covers authenticator-enroll-data-phone voice flow', () => {
    [
      'identify-with-password',
      'authenticator-enroll-select-authenticator',
      'authenticator-enroll-data-phone',
      'authenticator-enroll-phone-voice',
      'authenticator-verification-select-authenticator',
    ].forEach((test) => {
      expect(tests.includes(test)).toBeTruthy();
    });
  });

  it('covers reset-password-email-securityquestion flow', () => {
    [
      'flow-entry-payload',
      'authenticator-email-verification-data',
      'authenticator-verification-email',
      'authenticator-verification-security-question',
      'authenticator-reset-password',
    ].forEach((test) => {
      expect(tests.includes(test)).toBeTruthy();
    });
  });

  it('covers reset-password-email-google-authenticator flow', () => {
    [
      'flow-entry-payload',
      'authenticator-email-verification-data',
      'authenticator-verification-email',
      'authenticator-reset-password',
      'authenticator-verification-select-authenticator',
      'authenticator-verification-google-authenticator',
    ].forEach((test) => {
      expect(tests.includes(test)).toBeTruthy();
    });
  });
});
