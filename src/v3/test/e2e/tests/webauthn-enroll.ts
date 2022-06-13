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

fixture('WebAuthN Enrollment')
  .page('http://localhost:8080/?siw-use-mocks=true&siw-mock-scenario=webauthn-enroll-mfa');

test('User can enroll with WebAuthN', async (t) => {
  await checkA11y(t);
  // login with username/password
  await t
    .typeText("input[id='#/properties/identifier']", 'testuser@okta.com')
    .typeText("input[id='#/properties/credentials/properties/passcode']", 'password')
    .click("button[data-testid='#/properties/submit']");

  await t
    .expect(Selector('h2').withExactText('Set up security methods').exists)
    .ok();
  await t
    .expect(Selector('p')
      .withExactText('Security methods help protect your account by ensuring only you have access.')
      .exists).ok();
  await checkA11y(t);

  // enter WebAuthN security method
  await t.click(Selector('div').withAttribute('role', 'button'));

  await t
    .expect(Selector('h2').withExactText('Set up security key or biometric authenticator').exists)
    .ok();
  await t
    .expect(Selector('p')
      // .withExactText('You will be prompted to use a security key or biometric verification (Windows Hello, Touch ID, etc.). Follow the instructions to complete verification.')
      .withExactText('Security key or biometric authenticator is not supported on this browser. Select another factor or contact your admin for assistance.')
      .exists).ok();

  await checkA11y(t);
});
