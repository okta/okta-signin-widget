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

fixture('Unlock account with SMS and verify with WebAuthN')
  .page('http://localhost:8080/?siw-use-mocks=true&siw-mock-scenario=unlock-account-sms-verify-with-webauthn');

const submitButton = Selector('button').withAttribute('data-testid', '#/properties/submit');

const assertUnlockFlowUsingSMSAndWebAuthN = async (t: TestController) => {
  const titleTag = Selector('h2');
  const paragraphTag = Selector('p');
  const divButton = Selector('div').withAttribute('role', 'button');
  const inputElement = Selector('input').withAttribute('type', 'text');

  await t.expect(titleTag.withExactText('Unlock account?').exists).ok();

  await checkA11y(t);

  await t
    .typeText("input[id='#/properties/identifier']", 'testuser@okta.com')
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

  const smsCodeField = inputElement.withAttribute('id', '#/properties/credentials/properties/passcode');

  await t.typeText(smsCodeField, '123456');

  await checkA11y(t);

  await t.click(submitButton);

  await t.expect(titleTag.withExactText("Verify it's you with a security method").exists).ok();
  await t
    .expect(paragraphTag
      .withExactText('Select from the following options')
      .exists).ok();

  await checkA11y(t);

  await t.click(divButton.withText('Security Key or Biometric'));

  await t
    .expect(titleTag.withExactText('Set up security key or biometric authenticator').exists)
    .ok();
  await t
    .expect(paragraphTag
      // Testcafe is not compatible with the Browser Credentials object
      // So the message that surfaces in the e2e suite is one that indicates webauthn is not supported
      // for this reason, we are commenting out the expected message for the non-supported scenario message
      // .withExactText('You will be prompted to use a security key or biometric verification (Windows Hello, Touch ID, etc.). Follow the instructions to complete verification.')
      .withExactText('Security key or biometric authenticator is not supported on this browser. Select another factor or contact your admin for assistance.')
      .exists).ok();

  await checkA11y(t);
};

// eslint-disable-next-line testcafe-community/expectExpect
test('User clicks the Unlock account link and uses SMS and verifies with WebAuthN', async (t) => {
  await checkA11y(t);
  // click unlock account button
  await t.click("button[data-testid='#/properties/unlock-account']");

  await assertUnlockFlowUsingSMSAndWebAuthN(t);
});

// eslint-disable-next-line testcafe-community/expectExpect
test('User tries to login using a locked profile and unlocks account using sms and webAuthN', async (t) => {
  await checkA11y(t);
  // login with username/password
  await t
    .typeText("input[id='#/properties/identifier']", 'testuser@okta.com')
    .typeText("input[id='#/properties/credentials/properties/passcode']", 'password')
    .click(submitButton);

  await assertUnlockFlowUsingSMSAndWebAuthN(t);
});
