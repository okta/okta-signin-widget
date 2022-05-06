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

fixture('Google Authenticator verify')
  .page('http://localhost:8080/?siw-use-mocks=true&siw-mock-scenario=google-auth-verify');

test('User can verify using Google Authenticator app', async (t) => {
  await checkA11y(t);
  // login with username/password
  await t
    .typeText("input[id='#/properties/username']", 'testuser@okta.com')
    .typeText("input[id='#/properties/password']", 'password')
    .click("button[data-testid='#/properties/submit']");

  await t
    .expect(Selector('h2').withExactText('Verify with Google Authenticator').exists)
    .ok();
  await t
    .expect(Selector('p')
      .withExactText('Enter the temporary code generated in your Google Authenticator app')
      .exists).ok();

  const verificationCodeField = Selector('input')
    .withAttribute('type', 'text')
    .withAttribute('id', '#/properties/verificationCode');

  await t.expect(verificationCodeField.exists).ok();
  await checkA11y(t);

  // Token is invalid using mocks, so the below will fail
  // await t.typeText(verificationCodeField, '123456');

  // await t.click("button[data-testid='#/properties/submit']");
});
