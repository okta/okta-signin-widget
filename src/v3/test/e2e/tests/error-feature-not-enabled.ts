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

fixture('Error - feature not enabled')
  .page('http://localhost:8080/?siw-use-mocks=true&siw-mock-scenario=error-feature-not-enabled');

test('Widget is loaded and error displays that the feature is not enabled (when org is not OIE enabled)', async (t) => {
  await t.expect(Selector('span')
    .withText('The requested feature is not enabled in this environment.').exists).ok();

  // OKTA-485565, OKTA-485564, OKTA-485562
  // await checkA11y(t);
});
