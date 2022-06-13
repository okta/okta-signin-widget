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

fixture('Reset Password w/ Email and Security Question')
  .page('http://localhost:8080/?siw-use-mocks=true&siw-mock-scenario=reset-password-email-securityquestion');

test('User can reset their password using email factor and security question', async (t) => {
  await checkA11y(t);
  // click forgot password button
  await t
    .click("button[data-testid='#/properties/forgotPassword']");

  await checkA11y(t);

  const submitButton = Selector('button')
    .withAttribute('data-testid', '#/properties/submit');

  // ensure we're on the recovery view
  const title = Selector('h2');
  await t
    .expect(title.withExactText('Reset your password').exists)
    .ok();

  await checkA11y(t);

  // enter username and click submit
  await t
    .typeText("input[id='#/properties/identifier']", 'testuser@okta.com')
    .click(submitButton);

  await checkA11y(t);

  await t
    .expect(title.withExactText('Verify with your email').exists)
    .ok();

  // verification data view
  await t
    .expect(Selector('p')
      .withExactText('Verify with an email link or enter a code sent to your email.').exists)
    .ok();
  await t
    .click(submitButton.withText('Send me an email'));

  // click 'enter code from email' button
  const enterCodeButton = Selector('button').withExactText('Enter a code from the email instead');

  await checkA11y(t);

  await t
    .expect(enterCodeButton.exists)
    .ok()
    .click(enterCodeButton);

  await checkA11y(t);

  // enter code
  await t
    .typeText("input[id='#/properties/credentials/properties/passcode']", '123456')
    .click(submitButton);

  await checkA11y(t);

  // ensure we're on the security question verify view
  const answerLabel = Selector('label')
    .withAttribute('for', '#/properties/credentials/properties/answer');

  await t
    .expect(title.withExactText('Verify with your Security Question').exists)
    .ok()
    .expect(answerLabel.withExactText('Who is your daddy and what does he do?').exists)
    .ok();

  // enter security question answer
  await t
    .typeText("input[id='#/properties/credentials/properties/answer']", 'Fireman');

  await t
    .click(submitButton);

  await checkA11y(t);

  await t
    .expect(Selector('h2').withExactText('Reset your password').exists)
    .ok();
  await t
    .expect(Selector('span').withExactText('Requirements:').exists)
    .ok();

  await checkA11y(t);

  await t
    .typeText("input[id='#/properties/credentials/properties/passcode']", 'P@ssword123')
    .typeText("input[id='#/properties/credentials/properties/confirmPassword']", 'P@ssword123')
    .expect(Selector("button[data-testid='#/properties/submit']").exists)
    .ok();
});

test('User enters forgot password flow and cancels', async (t) => {
  await checkA11y(t);

  // click forgot password button
  await t
    .click("button[data-testid='#/properties/forgotPassword']");

  await t.expect(
    Selector("input[id='#/properties/identifier']").exists,
  ).ok();

  await checkA11y(t);

  await t
    .click("button[data-testid='#/properties/cancel']");

  await t.expect(
    Selector("input[id='#/properties/identifier']").exists,
  ).ok();
  await t.expect(
    Selector("input[id='#/properties/credentials/properties/passcode']").exists,
  ).ok();
});
