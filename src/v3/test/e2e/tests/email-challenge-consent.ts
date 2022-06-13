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

fixture('Unlock account - Email Magic link consent')
  .page('http://localhost:8080/?siw-use-mocks=true&siw-mock-scenario=email-challenge-consent');

test('User is presented with consent options of unlocking account their account', async (t) => {
  // Verifying Auth coin is set
  // await t
  //   .expect(Selector('svg[aria-labelledby="emailAuthenticator"]').exists)
  //   .ok();

  await t
    .expect(Selector('h2').withExactText('Did you just try to sign in?').exists)
    .ok();

  await t
    .expect(Selector('svg[aria-labelledby="desktop"]').exists)
    .ok();
  await t
    .expect(Selector('span').withExactText('CHROME').exists)
    .ok();
  await t
    .expect(Selector('svg[aria-labelledby="dashboard"]').exists)
    .ok();
  await t
    .expect(Selector('span').withExactText('Okta Dashboard').exists)
    .ok();

  await t
    .expect(Selector('button')
      .withExactText("No, it's not me")
      .exists).ok();
  await t
    .expect(Selector('button')
      .withExactText("Yes, it's me")
      .exists).ok();

  await checkA11y(t);
}).clientScripts({
  content: `
    window.additionalOptions = {
      stateToken: 'dummy_state_token',
    };
  `,
});
