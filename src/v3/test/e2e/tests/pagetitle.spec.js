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

import { fixture, ClientFunction } from 'testcafe';

const getTitle = ClientFunction(() => document.title);

fixture('PageTitle')
  .page('http://localhost:3000/?siw-use-mocks=true&siw-mock-response=/idp/idx/identify/default');

test('Page title applies correctly', async (t) => {
  // title should not inlcude escaped characters
  await t.expect(getTitle()).eql('Verify it\'s you with a security method');
});
