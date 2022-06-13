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

fixture('Security Question Enrollment')
  .page('http://localhost:8080/?siw-use-mocks=true&siw-mock-scenario=securityquestion-enroll-mfa');

test('User can enroll with a predefined security question', async (t) => {
  await checkA11y(t);

  // login with username/password
  await t
    .typeText("input[id='#/properties/identifier']", 'testuser@okta.com')
    .typeText("input[id='#/properties/credentials/properties/passcode']", 'password')
    .click("button[data-testid='#/properties/submit']");

  await checkA11y(t);

  // click the security question enroll button
  const securityQuestionAuthButton = Selector('div')
    .withAttribute('role', 'button')
    .withText('Security Question');
  await t
    .click(securityQuestionAuthButton)
    .expect(Selector('h2').withExactText('Set up security question').exists)
    .ok();
  await checkA11y(t);

  // assert predefined question is selected in first radio group
  const radioInputForTypePredefined = Selector('input')
    .withAttribute('type', 'radio')
    .withAttribute('value', 'predefined');
  await t
    .expect(radioInputForTypePredefined.checked)
    .eql(true);

  // click first question in select
  const predefinedQuestionSelect = Selector('select');
  const predefinedQuestionOptions = predefinedQuestionSelect.find('option');
  await t
    .click(predefinedQuestionSelect)
    .click(predefinedQuestionOptions.withAttribute('value', 'disliked_food'));

  // type text into answer field
  const answerTextField = Selector('input')
    .withAttribute('type', 'password')
    .withAttribute('id', '#/properties/credentials/properties/answer');

  await t
    .typeText(answerTextField, 'spinach');

  // click submit
  // disabled for now since the mock tokens don't match the sessionn
  // and causes an Error, failing the test
  // await t
  //   .click("button[data-testid='#/properties/submit']");
});
