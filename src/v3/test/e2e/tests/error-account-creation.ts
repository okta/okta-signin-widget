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

fixture('Register account with error')
  .page('http://localhost:8080/?siw-use-mocks=true&siw-mock-scenario=error-account-creation');

test('User enters the profile registration flow and on submission returns error', async (t) => {
  await checkA11y(t);

  // click register button
  await t.click(Selector('button').withText('Register'));

  await checkA11y(t);
  await t
    .typeText("input[id='#/properties/userProfile/properties/firstName']", 'tester')
    .typeText("input[id='#/properties/userProfile/properties/lastName']", 'McTesterson')
    .typeText("input[id='#/properties/userProfile/properties/email']", 'tester@okta.com');

  await t.click("button[data-testid='#/properties/submit'");

  await t.expect(Selector('span')
    .withText('There was an error creating your account. Please try registering again.').exists)
    .ok();
  await t.expect(Selector('a').innerText).eql('Back to sign in');

  // OKTA-485565, OKTA-485564, OKTA-485562
  // await checkA11y(t);
});
