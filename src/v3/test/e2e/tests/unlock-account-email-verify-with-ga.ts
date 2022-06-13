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

fixture('Unlock account with Email and verify with Google Authenticator')
  .page('http://localhost:8080/?siw-use-mocks=true&siw-mock-scenario=unlock-account-email-verify-with-ga');

const assertUnlockFlowUsingEmailAndGoogleAuthenticator = async (t: TestController) => {
  const titleTag = Selector('h2');
  const paragraphTag = Selector('p');
  const divButton = Selector('div').withAttribute('role', 'button');
  const buttonElement = Selector('button');
  const submitButton = buttonElement.withAttribute('data-testid', '#/properties/submit');

  await t
    .expect(titleTag.withExactText('Unlock account?').exists)
    .ok();

  await checkA11y(t);

  await t
    .typeText("input[id='#/properties/identifier']", 'testuser@okta.com')
    .click(divButton.withText('Email'));

  await t.expect(titleTag.withExactText('Verify with your email').exists).ok();
  await t
    .expect(paragraphTag
      .withExactText('We sent you a verification email. Click the verification link in your email to continue or enter the code below.')
      .exists).ok();
  await checkA11y(t);

  await t.click(buttonElement.withText('Enter a code from the email instead'));

  const verificationCodeField = Selector('input')
    .withAttribute('type', 'text')
    .withAttribute('id', '#/properties/credentials/properties/passcode');

  await t.typeText(verificationCodeField, '123456');

  await checkA11y(t);

  await t.click(submitButton);

  await t.expect(titleTag.withExactText("Verify it's you with a security method").exists).ok();
  await t
    .expect(paragraphTag
      .withExactText('Select from the following options')
      .exists).ok();

  await checkA11y(t);

  await t.click(divButton.withText('Google Authenticator'));

  await t.expect(titleTag.withExactText('Verify with Google Authenticator').exists).ok();
  await t
    .expect(paragraphTag
      .withExactText('Enter the temporary code generated in your Google Authenticator app')
      .exists).ok();

  const gaVerificationCodeField = Selector('input')
    .withAttribute('type', 'text')
    .withAttribute('id', '#/properties/credentials/properties/passcode');

  await t.typeText(gaVerificationCodeField, '123456');

  await checkA11y(t);

  await t.click(submitButton);

  await t.expect(titleTag.withExactText('Account successfully unlocked!').exists).ok();

  await t
    .expect(paragraphTag.withExactText('You can log in using your existing username and password.').exists)
    .ok();

  await t.expect(Selector('a').withExactText('Back to sign in').exists).ok();

  await checkA11y(t);
};

// eslint-disable-next-line testcafe-community/expectExpect
test('User clicks the Unlock account link and uses Email and verifies with Google Authenticator', async (t) => {
  await checkA11y(t);
  // click unlock account button
  await t.click(Selector('button').withAttribute('data-testid', '#/properties/unlock-account'));

  await assertUnlockFlowUsingEmailAndGoogleAuthenticator(t);
});

// eslint-disable-next-line testcafe-community/expectExpect
test('User tries to login using a locked profile and unlocks account using email and Google Authenticator', async (t) => {
  await checkA11y(t);
  // login with username/password
  await t
    .typeText("input[id='#/properties/identifier']", 'testuser@okta.com')
    .typeText("input[id='#/properties/credentials/properties/passcode']", 'password')
    .click("button[data-testid='#/properties/submit']");

  await assertUnlockFlowUsingEmailAndGoogleAuthenticator(t);
});
