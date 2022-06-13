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

fixture('Unlock account with SMS')
  .page('http://localhost:8080/?siw-use-mocks=true&siw-mock-scenario=unlock-account-sms');

test('User can unlock account using SMS', async (t) => {
  await checkA11y(t);
  // click unlock account button
  await t.click("button[data-testid='#/properties/unlock-account']");

  await t
    .expect(Selector('h2').withExactText('Unlock account?').exists)
    .ok();

  await checkA11y(t);

  await t
    .typeText("input[id='#/properties/identifier']", 'testuser@okta.com')
    .click(Selector('div').withAttribute('role', 'button').withText('Phone'));

  await t
    .expect(Selector('h2').withExactText('Verify with your phone').exists)
    .ok();
  await t
    .expect(Selector('p')
      .withExactText('A code was sent to your phone. Enter the code below to verify.')
      .exists).ok();
  await t
    .expect(Selector('p')
      .withExactText('Carrier messaging charges may apply')
      .exists).ok();
  await checkA11y(t);

  const verificationCodeField = Selector('input')
    .withAttribute('type', 'text')
    .withAttribute('id', '#/properties/credentials/properties/passcode');

  await t.typeText(verificationCodeField, '123456');

  await t.click(Selector('button').withAttribute('data-testid', '#/properties/submit'));

  await t
    .expect(Selector('h2').withExactText('Account successfully unlocked!').exists)
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
