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

fixture('Register account')
  .page('http://localhost:8080/?siw-use-mocks=true&siw-mock-scenario=register-with-email-mfa');

test('User enters the profile registration flow and cancels', async (t) => {
  await checkA11y(t);

  // click register button
  await t
    .click(Selector('button').withText('Register'));

  await t.expect(
    Selector("input[id='#/properties/firstName']").exists,
  ).ok();
  await t.expect(
    Selector("input[id='#/properties/lastName']").exists,
  ).ok();
  await t
    .expect(
      Selector("input[id='#/properties/email']").exists,
    ).ok();

  await checkA11y(t);

  await t
    .click("button[data-testid='#/properties/cancel']");

  await t.expect(
    Selector("input[id='#/properties/username']").exists,
  ).ok();
  await t.expect(
    Selector("input[id='#/properties/password']").exists,
  ).ok();
});
