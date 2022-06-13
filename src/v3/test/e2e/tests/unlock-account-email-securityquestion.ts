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

fixture('Unlock Account w/ Email & Verify w/ Security Question')
  .page('http://localhost:8080/?siw-use-mocks=true&siw-mock-scenario=unlock-account-email-securityquestion');

test('User can unlock account using email', async (t) => {
  await checkA11y(t);
  // click unlock account button
  await t.click("button[data-testid='#/properties/unlock-account']");

  const submitButton = Selector('button')
    .withAttribute('data-testid', '#/properties/submit');
  const title = Selector('h2');

  await t
    .expect(title.withExactText('Unlock account?').exists)
    .ok();

  await checkA11y(t);

  await t
    .typeText("input[id='#/properties/identifier']", 'testuser@okta.com')
    .click(Selector('div').withAttribute('role', 'button').withText('Email'));

  await t
    .expect(title.withExactText('Verify with your email').exists)
    .ok();
  await t
    .expect(Selector('p')
      .withExactText('We sent you a verification email. Click the verification link in your email to continue or enter the code below.')
      .exists).ok();
  await checkA11y(t);

  await t.click(Selector('button').withText('Enter a code from the email instead'));

  await checkA11y(t);

  const verificationCodeField = Selector('input')
    .withAttribute('type', 'text')
    .withAttribute('id', '#/properties/credentials/properties/passcode');

  await t.typeText(verificationCodeField, '123456');

  await t.click(submitButton);

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

  await checkA11y(t);

  await t
    .click(submitButton);

  await t
    .expect(title.withExactText('Account successfully unlocked!').exists)
    .ok();

  await t
    .expect(Selector('p')
      .withExactText('You can log in using your existing username and password.').exists)
    .ok();

  await t
    .expect(Selector('a').withExactText('Back to sign in').exists)
    .ok();

  await checkA11y(t);
});

test('User enters unlock account flow and cancels', async (t) => {
  await checkA11y(t);

  // click unlock account button
  await t.click("button[data-testid='#/properties/unlock-account']");

  await t
    .expect(Selector('h2').withExactText('Unlock account?').exists)
    .ok();

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
