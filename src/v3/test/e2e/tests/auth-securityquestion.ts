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

fixture('Login with Security Question MFA')
  .page('http://localhost:8080/?siw-use-mocks=true&siw-mock-scenario=auth-with-securityquestion');

test('User can login with security question', async (t) => {
  await checkA11y(t);

  const submitButton = Selector('button')
    .withAttribute('data-testid', '#/properties/submit');

  // enter username/pw and submit
  await t
    .typeText("input[id='#/properties/identifier']", 'testuser@okta.com')
    .typeText("input[id='#/properties/credentials/properties/passcode']", 'password')
    .click(submitButton);

  await checkA11y(t);

  // ensure we're on the security question verify view
  const title = Selector('h2');
  const answerLabel = Selector('label');

  await t
    .expect(title.withExactText('Verify with your Security Question').exists)
    .ok()
    .expect(answerLabel.withExactText('What is the food you least liked as a child?').exists)
    .ok();

  // enter security question answer
  await t
    .typeText("input[id='#/properties/credentials/properties/answer']", 'Broccoli');

  // click submit
  // disabled for now since the mock tokens don't match the sessionn
  // and causes an Error, failing the test
  // .click(submitButton);
});
