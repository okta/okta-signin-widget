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

import { Selector } from 'testcafe';

import { checkA11y } from '../util/A11y';

fixture('Password Reset & verify with Google Authenticator')
  .page('http://localhost:8080/?siw-use-mocks=true&siw-mock-scenario=reset-password-email-google-auth-verify');

test('User can reset password and authenticate with Google Authenticator', async (t) => {
  // click forgot password button
  await t.click("button[data-testid='#/properties/forgotPassword']");

  await t
    .expect(Selector('h2').withText('Reset your password').exists)
    .ok();

  await checkA11y(t);

  await t
    .typeText("input[id='#/properties/username']", 'testuser@okta.com')
    .click(Selector('button').withAttribute('data-testid', '#/properties/submit'));

  await checkA11y(t);

  await t
    .expect(Selector('h2').withExactText('Verify with your email').exists)
    .ok();

  await t
    .expect(Selector('p')
      .withExactText('We sent you a verification email. Click the verification link in your email to continue or enter the code below.')
      .exists).ok();

  await checkA11y(t);

  await t.click(Selector('button').withText('Enter a code from the email instead'));

  const verificationCodeField = Selector('input')
    .withAttribute('type', 'text')
    .withAttribute('id', '#/properties/verificationCode');

  await t.typeText(verificationCodeField, '123456');

  await t.click(Selector('button').withAttribute('data-testid', '#/properties/submit'));

  await t
    .expect(Selector('h2').withExactText('Reset your password').exists)
    .ok();
  await t
    .expect(Selector('span').withExactText('Requirements:').exists)
    .ok();

  await checkA11y(t);

  await t
    .typeText("input[id='#/properties/password']", 'P@ssword123')
    .typeText("input[id='#/properties/confirmPassword']", 'P@ssword123')
    .click("button[data-testid='#/properties/submit']");

  await t
    .expect(Selector('h2').withExactText("Verify it's you with a security method").exists)
    .ok();
  await t
    .expect(Selector('p')
      .withExactText('Select from the following options')
      .exists).ok();
  await checkA11y(t);

  await t.click(Selector('div').withAttribute('role', 'button').nth(0));

  await t
    .expect(Selector('h2').withExactText('Verify with Google Authenticator').exists)
    .ok();
  await t
    .expect(Selector('p')
      .withExactText('Enter the temporary code generated in your Google Authenticator app')
      .exists).ok();

  await t.expect(Selector('input')
    .withAttribute('type', 'text')
    .withAttribute('id', '#/properties/verificationCode').exists).ok();

  await checkA11y(t);

  // Token is invalid using mocks, so the below will fail
  // await t.typeText(verificationCodeField, '123456');

  // await t.click("button[data-testid='#/properties/submit']");
});
