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

fixture('Google Auth Scan QR Code to Enroll')
  .page('http://localhost:8080/?siw-use-mocks=true&siw-mock-scenario=google-auth-scan-enroll');

test('User can enroll using Google Authenticator', async (t) => {
  await checkA11y(t);
  // login with username/password
  await t
    .typeText("input[id='#/properties/username']", 'testuser@okta.com')
    .typeText("input[id='#/properties/password']", 'password')
    .click("button[data-testid='#/properties/submit']");

  await t.click(Selector('div').withAttribute('role', 'button'));

  await t
    .expect(Selector('h2').withExactText('Set up Google Authenticator').exists)
    .ok();
  await t
    .expect(Selector('p')
      .withExactText('Launch Google Authenticator, tap the "+" icon, then select "Scan barcode".')
      .exists).ok();

  await t.expect(Selector('img').withAttribute('alt', 'Google Authenticator').exists).ok();
  await checkA11y(t);

  await t.click(Selector('button').withText('Set up a different way'));

  const paragraphs = Selector('p');
  await t
    .expect(
      paragraphs.nth(0).innerText,
    ).eql('To set up manually enter your Okta Account username and then input the following in the Secret Key Field');

  await t
    .expect(
      paragraphs.nth(1).innerText,
    ).eql('K A G W B I X A K O L P E F M Y');
  await checkA11y(t);

  await t.click(Selector('button').withText('Next'));

  await t
    .expect(Selector('p')
      .withExactText('Enter code displayed from application').exists).ok();

  const verificationCodeField = Selector('input')
    .withAttribute('type', 'text')
    .withAttribute('id', '#/properties/verificationCode');

  await t.typeText(verificationCodeField, '123456');
  await checkA11y(t);

  await t.click("button[data-testid='#/properties/submit']");

  await t
    .expect(Selector('h2').withExactText('Set up security methods').exists)
    .ok();
  await checkA11y(t);
});
