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

fixture('Terminal Email Success Verification Test')
  .page('http://localhost:8080/?siw-use-mocks=true&siw-mock-scenario=terminal-return-email');

test('Successful email link verification view, prompt to return to original tab', async (t) => {
  // Verifying authcoin
  await t
    .expect(Selector('svg[aria-labelledby="emailAuthenticator"]').exists)
    .ok();

  await t.expect(Selector('h2').innerText).eql('Success! Return to the original tab or window');
  const paragraphs = Selector('p');
  await t
    .expect(
      paragraphs.nth(0).innerText,
    ).eql('To continue, please return to the original browser tab or window you used to verify.');
  await t
    .expect(
      paragraphs.nth(1).innerText,
    ).eql('Close this window anytime.');

  await checkA11y(t);
});
