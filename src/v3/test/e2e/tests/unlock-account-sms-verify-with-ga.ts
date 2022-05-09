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

fixture('Unlock account with SMS and verify with Google Authenticator')
  .page('http://localhost:8080/?siw-use-mocks=true&siw-mock-scenario=unlock-account-sms-verify-with-ga');

test('User clicks the Unlock account link and uses SMS and verifies with Google Authenticator', async (t) => {
  const titleTag = Selector('h2');
  const paragraphTag = Selector('p');
  const divButton = Selector('div').withAttribute('role', 'button');
  const buttonElement = Selector('button');
  const submitButton = buttonElement.withAttribute('data-testid', '#/properties/submit');
  const inputElement = Selector('input').withAttribute('type', 'text');

  await checkA11y(t);
  // click unlock account button
  await t.click("button[data-testid='#/properties/unlockAccount']");

  await t.expect(titleTag.withExactText('Unlock account?').exists).ok();

  await checkA11y(t);

  await t
    .typeText("input[id='#/properties/username']", 'testuser@okta.com')
    .click(divButton.withText('Phone'));

  await t.expect(titleTag.withExactText('Verify with your phone').exists).ok();
  await t
    .expect(paragraphTag
      .withExactText('A code was sent to your phone. Enter the code below to verify.')
      .exists).ok();
  await t
    .expect(paragraphTag
      .withExactText('Carrier messaging charges may apply')
      .exists).ok();

  const smsCodeField = inputElement.withAttribute('id', '#/properties/verificationCode');

  await t.typeText(smsCodeField, '123456');

  await checkA11y(t);

  await t.click(submitButton);

  await t.expect(titleTag.withExactText('Verify with Google Authenticator').exists).ok();
  await t
    .expect(paragraphTag
      .withExactText('Enter the temporary code generated in your Google Authenticator app')
      .exists).ok();

  const gaVerificationCodeField = inputElement.withAttribute('id', '#/properties/verificationCode');

  await t.typeText(gaVerificationCodeField, '123456');

  await checkA11y(t);

  await t.click(submitButton);
  await t.expect(titleTag.withExactText('Account successfully unlocked!').exists).ok();

  await t.expect(paragraphTag.withExactText('You can log in using your existing username and password.').exists).ok();

  await t.expect(Selector('a').withExactText('Back to sign in').exists).ok();

  await checkA11y(t);
});

test('User tries to login using a locked profile and unlocks account using sms and Google Authenticator', async (t) => {
  const divButton = Selector('div').withAttribute('role', 'button');

  await checkA11y(t);
  // login with username/password
  await t
    .typeText("input[id='#/properties/username']", 'testuser@okta.com')
    .typeText("input[id='#/properties/password']", 'password')
    .click("button[data-testid='#/properties/submit']");

  await t.click(divButton);

  await t.expect(divButton.withText('Email').exists).ok();
  await t.expect(divButton.withText('Phone').exists).ok();
  await t.expect(divButton.withText('Okta Verify').exists).ok();

  // TODO: OKTA-484930 awaiting this ticket to be completed to enable this flow to work
});
