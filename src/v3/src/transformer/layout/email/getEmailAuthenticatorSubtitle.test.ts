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

import { getEmailAuthenticatorSubtitle } from './getEmailAuthenticatorSubtitle';

describe('getEmailAuthenticatorSubtitle Tests', () => {
  it('should get subtitle when email address available and use email magic link = false', () => {
    const subtitle = getEmailAuthenticatorSubtitle('someuser@okta1.com', undefined, false);

    expect(subtitle)
      .toBe('oie.email.verify.alternate.magicLinkToEmailAddressoie.email.verify.alternate.verificationCode.instructions');
  });

  it('should get subtitle when email address available and use email magic link = true', () => {
    const subtitle = getEmailAuthenticatorSubtitle('someuser@okta1.com', undefined, true);

    expect(subtitle)
      .toBe('oie.email.verify.alternate.magicLinkToEmailAddressoie.email.verify.alternate.instructions');
  });

  it('should get subtitle when secondary email address available and use email magic link = false', () => {
    const subtitle = getEmailAuthenticatorSubtitle('someuser@okta1.com', 'secondary@okta1.com', false);

    expect(subtitle)
      .toBe('oie.email.verify.alternate.magicLinkToEmailAddress.with.secondary.emailoie.email.verify.alternate.verificationCode.instructions');
  });

  it('should get subtitle when secondary email address available and use email magic link = true', () => {
    const subtitle = getEmailAuthenticatorSubtitle('someuser@okta1.com', 'secondary@okta1.com', true);

    expect(subtitle)
      .toBe('oie.email.verify.alternate.magicLinkToEmailAddress.with.secondary.emailoie.email.verify.alternate.instructions');
  });

  it('should get subtitle when email address = undefined and use email magic link = false', () => {
    const subtitle = getEmailAuthenticatorSubtitle(undefined, undefined, false);

    expect(subtitle)
      .toBe('oie.email.verify.alternate.magicLinkToYourEmailoie.email.verify.alternate.verificationCode.instructions');
  });

  it('should get subtitle when email address = undefined and use email magic link = true', () => {
    const subtitle = getEmailAuthenticatorSubtitle(undefined, undefined, true);

    expect(subtitle)
      .toBe('oie.email.verify.alternate.magicLinkToYourEmailoie.email.verify.alternate.instructions');
  });
});
