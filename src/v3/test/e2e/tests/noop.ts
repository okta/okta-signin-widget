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

fixture('Getting Started')
  .page('http://localhost:8080/?siw-use-mocks=true');

test('Simple test to be removed later', async (t) => {
  // Test code
  await t
    .typeText("input[id='#/properties/username']", 'testuser@okta.com')
    .typeText("input[id='#/properties/password']", 'password')
    .expect(Selector("button[data-testid='#/properties/submit']").exists)
    // .click("button[data-testid='#/properties/submit']")
    // .expect(Selector('legend').withExactText('authenticator').exists)
    .ok();
});

// eslint-disable-next-line
test('Automated accessibility testing', async (t) => {
  await checkA11y(t);
});
