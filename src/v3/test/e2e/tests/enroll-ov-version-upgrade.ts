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

// TOOD: re-enable - OKTA-497179
fixture.skip('Okta Verify Authenticator Enrollment Version Upgrade')
  .page('http://localhost:8080/?siw-use-mocks=true&siw-mock-scenario=enroll-ov-version-upgrade');

test('User is unable to enroll with Okta Verify when device used to setup OV is incompatible', async (t) => {
  const submitButton = Selector('button').withAttribute('data-testid', '#/properties/submit');
  const header = Selector('h2');
  await checkA11y(t);
  // login with username/password
  await t
    .typeText("input[id='#/properties/username']", 'testuser@okta.com')
    .typeText("input[id='#/properties/password']", 'password')
    .click(submitButton);

  // Verify using GA
  await t
    .expect(header.withExactText('Verify with Google Authenticator').exists)
    .ok();
  await t
    .expect(Selector('p')
      .withExactText('Enter the temporary code generated in your Google Authenticator app')
      .exists).ok();

  const verificationCodeField = Selector('input')
    .withAttribute('type', 'text')
    .withAttribute('id', '#/properties/verificationCode');

  await t.typeText(verificationCodeField, '123456');
  await checkA11y(t);

  await t.click(submitButton);

  // Authenticator list with OV as a required option
  await t
    .expect(header.withExactText('Set up security methods').exists)
    .ok();
  await checkA11y(t);

  await t.click(Selector('div').withAttribute('role', 'button').withText('Okta Verify'));

  // QR code enrollment page
  await t
    .expect(Selector('h2').withExactText('Set up Okta Verify').exists)
    .ok();

  await t.expect(Selector('span')
    // special character for single quote in translation not allowed here, partial matching
    .withText('The device used to set up Okta Verify does not meet your').exists)
    .ok();

  // OKTA-485565, OKTA-485564, OKTA-485562
  // await checkA11y(t);
});
