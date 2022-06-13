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

fixture('Login using Email MFA and invalid code')
  .page('http://localhost:8080/?siw-use-mocks=true&siw-mock-scenario=error-401-invalid-otp-passcode');

test('User can login using profile and email MFA, but uses invalid challenge code', async (t) => {
  await checkA11y(t);

  const submitButton = Selector('button')
    .withAttribute('data-testid', '#/properties/submit');

  // enter username/pw and submit
  await t
    .typeText("input[id='#/properties/identifier']", 'testuser@okta.com')
    .typeText("input[id='#/properties/credentials/properties/passcode']", 'password')
    .click(submitButton);

  // ensure we're on the authenticator selection view
  const title = Selector('h2');
  await t
    .expect(Selector('h2').withExactText("Verify it's you with a security method").exists)
    .ok();

  await checkA11y(t);

  // click phone authenticator button
  await t.click(Selector('div')
    .withAttribute('role', 'button')
    .withText('Email'));

  await t.expect(title.withExactText('Verify with your email').exists).ok();

  await checkA11y(t);

  await t.click(Selector('button').withExactText('Enter a code from the email instead'));

  await checkA11y(t);

  // ensure we're on the SMS verification view
  await t
    .typeText("input[id='#/properties/credentials/properties/passcode']", '123456');

  // enter code
  await t.click(submitButton);

  // TODO: disable for now, stepper states should be preserved cross requests - OKTA-505880
  // await t.expect(Selector('span').withText('Invalid code. Try again.').exists).ok();

  // OKTA-485565, OKTA-485564, OKTA-485562
  // await checkA11y(t);
});
