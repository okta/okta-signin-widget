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

const assertRedirectionToAuthenticatorList = async (t: TestController) => {
  // wait 4.5 seconds (1sec poll rate x 4 repetitive poll requests with the last one being successful)
  // success takes user back to optional authenticators to enroll in
  await t
    .wait(4500)
    .expect(Selector('h2').withExactText('Set up security methods').exists)
    .ok();

  await t
    .expect(Selector('p').withExactText('Security methods help protect your account by ensuring only you have access.').exists)
    .ok();
  await t
    .expect(Selector('p').withExactText('Set up optional').exists)
    .ok();
  await checkA11y(t);
};

// TOOD: re-enable - OKTA-497179
fixture.skip('Okta Verify Authenticator Enrollment')
  .page('http://localhost:8080/?siw-use-mocks=true&siw-mock-scenario=enroll-okta-verify-mfa');

test('User can enroll using Okta Verify QRCode Scan to enroll', async (t) => {
  await checkA11y(t);
  // login with username/password
  await t
    .typeText("input[id='#/properties/identifier']", 'testuser@okta.com')
    .typeText("input[id='#/properties/credentials.passcode']", 'password')
    .click("button[data-testid='#/properties/submit']");

  // Verify using GA
  await t
    .expect(Selector('h2').withExactText('Verify with Google Authenticator').exists)
    .ok();
  await t
    .expect(Selector('p')
      .withExactText('Enter the temporary code generated in your Google Authenticator app')
      .exists).ok();

  const verificationCodeField = Selector('input')
    .withAttribute('type', 'text')
    .withAttribute('id', '#/properties/credentials.passcode');

  await t.typeText(verificationCodeField, '123456');
  await checkA11y(t);

  await t.click("button[data-testid='#/properties/submit']");

  // Authenticator list with OV as a required option
  await t
    .expect(Selector('h2').withExactText('Set up security methods').exists)
    .ok();
  await checkA11y(t);

  await t.click(Selector('div').withAttribute('role', 'button').withText('Okta Verify'));

  // QR code enrollment page
  await t
    .expect(Selector('h2').withExactText('Set up Okta Verify').exists)
    .ok();

  const instructions = Selector('li');
  await t
    .expect(
      instructions.nth(0).innerText,
    ).eql('On your mobile device, download the Okta Verify app from the App Store (iPhone and iPad) or Google Play (Android devices).');
  await t
    .expect(
      instructions.nth(1).innerText,
    ).eql('Open the app and follow the instructions to add your account');
  await t
    .expect(
      instructions.nth(2).innerText,
    ).eql('When prompted, tap Scan a QR code, then scan the QR code below:');

  await t.expect(Selector('img').withAttribute('alt', 'Okta Verify').exists).ok();
  await checkA11y(t);

  await assertRedirectionToAuthenticatorList(t);
});

test('User can enroll using Okta Verify SMS text link', async (t) => {
  await checkA11y(t);
  // login with username/password
  await t
    .typeText("input[id='#/properties/identifier']", 'testuser@okta.com')
    .typeText("input[id='#/properties/credentials.passcode']", 'password')
    .click("button[data-testid='#/properties/submit']");

  // Verify using GA
  await t
    .expect(Selector('h2').withExactText('Verify with Google Authenticator').exists)
    .ok();
  await t
    .expect(Selector('p')
      .withExactText('Enter the temporary code generated in your Google Authenticator app')
      .exists).ok();

  const verificationCodeField = Selector('input')
    .withAttribute('type', 'text')
    .withAttribute('id', '#/properties/credentials.passcode');

  await t.typeText(verificationCodeField, '123456');
  await checkA11y(t);

  await t.click("button[data-testid='#/properties/submit']");

  // Authenticator list with OV as a required option
  await t
    .expect(Selector('h2').withExactText('Set up security methods').exists)
    .ok();
  await checkA11y(t);

  await t.click(Selector('div').withAttribute('role', 'button').withText('Okta Verify'));

  // QR code enrollment page
  await t
    .expect(Selector('h2').withExactText('Set up Okta Verify').exists)
    .ok();

  await checkA11y(t);

  // Channel selection
  await t
    .click(Selector('button').withExactText('Can\'t scan?'));

  await t
    .expect(Selector('h2').withExactText('More options').exists)
    .ok();
  await t
    .expect(Selector('span').withText('Which option do you want to try?').exists)
    .ok();

  const smsChannelOption = Selector('input')
    .withAttribute('type', 'radio')
    .withAttribute('value', 'sms')
    .sibling('label');

  await t
    .expect(Selector('input')
      .withAttribute('type', 'radio')
      .withAttribute('value', 'email')
      .sibling('label')
      .withText('Email me a setup link').exists)
    .ok();

  await t.click(smsChannelOption);

  await checkA11y(t);

  await t.click("button[data-testid='#/properties/submit']");

  // Phone entry page
  await t
    .expect(Selector('h2').withExactText('Set up Okta Verify via SMS').exists)
    .ok();
  await t
    .expect(Selector('label').withExactText('Country').exists)
    .ok();

  const countrySelect = Selector('select');
  const countryOption = countrySelect.find('option');
  await t
    .click(countrySelect)
    .click(countryOption.withText('United States'))
    .expect(countryOption.withExactText('United States').exists).ok();

  const phoneNumberField = Selector('input')
    .withAttribute('type', 'tel')
    .withAttribute('id', '#/properties/phoneNumber');
  await t.typeText(phoneNumberField, '2165551234');

  await t
    .expect(
      Selector('p')
        .withExactText('Make sure you can access the text on your mobile device.').exists,
    )
    .ok();

  // OKTA-492499 - A11y fails because of Select Component attributes
  // await checkA11y(t);

  await t.click("button[data-testid='#/properties/setupLink']");

  // Waiting page (to click link from text)
  await t
    .expect(Selector('h2').withExactText('Check your text messages').exists)
    .ok();
  await t
    .expect(
      Selector('p')
        .withExactText('We sent an SMS to +12165332241 with an Okta Verify setup link. To continue, open the link on your mobile device.').exists,
    )
    .ok();
  await t.expect(Selector('button').withExactText('Try a different way').exists)
    .ok();

  await checkA11y(t);

  await assertRedirectionToAuthenticatorList(t);
});

test('User can enroll using Okta Verify Email link', async (t) => {
  await checkA11y(t);
  // login with username/password
  await t
    .typeText("input[id='#/properties/identifier']", 'testuser@okta.com')
    .typeText("input[id='#/properties/credentials.passcode']", 'password')
    .click("button[data-testid='#/properties/submit']");

  await t
    .expect(Selector('h2').withExactText('Verify with Google Authenticator').exists)
    .ok();
  await t
    .expect(Selector('p')
      .withExactText('Enter the temporary code generated in your Google Authenticator app')
      .exists).ok();

  const verificationCodeField = Selector('input')
    .withAttribute('type', 'text')
    .withAttribute('id', '#/properties/credentials.passcode');

  await t.typeText(verificationCodeField, '123456');
  await checkA11y(t);

  await t.click("button[data-testid='#/properties/submit']");

  await t
    .expect(Selector('h2').withExactText('Set up security methods').exists)
    .ok();
  await checkA11y(t);

  await t.click(Selector('div').withAttribute('role', 'button').withText('Okta Verify'));

  await t
    .expect(Selector('h2').withExactText('Set up Okta Verify').exists)
    .ok();

  await checkA11y(t);

  await t
    .click(Selector('button').withExactText('Can\'t scan?'));

  await t
    .expect(Selector('h2').withExactText('More options').exists)
    .ok();
  await t
    .expect(Selector('span').withText('Which option do you want to try?').exists)
    .ok();

  const emailChannelOption = Selector('input')
    .withAttribute('type', 'radio')
    .withAttribute('value', 'email')
    .sibling('label');

  await t
    .expect(Selector('input')
      .withAttribute('type', 'radio')
      .withAttribute('value', 'sms')
      .sibling('label')
      .withText('Text me a setup link').exists)
    .ok();

  await t.click(emailChannelOption);

  await checkA11y(t);

  await t.click("button[data-testid='#/properties/submit']");

  await t
    .expect(Selector('h2').withExactText('Set up Okta Verify via email link').exists)
    .ok();

  const emailField = Selector('input')
    .withAttribute('type', 'text')
    .withAttribute('id', '#/properties/email');

  await t.typeText(emailField, 'testuser@okta.com');

  await t
    .expect(
      Selector('p')
        .withExactText('Make sure you can access the email on your mobile device.').exists,
    )
    .ok();

  await checkA11y(t);

  await t.click("button[data-testid='#/properties/setupLink']");

  await t
    .expect(Selector('h2').withExactText('Check your email').exists)
    .ok();
  await t
    .expect(
      Selector('p')
        .withExactText('We sent an email to glen.fannin@okta.com with an Okta Verify setup link. To continue, open the link on your mobile device.').exists,
    )
    .ok();
  await t.expect(Selector('button').withExactText('Try a different way').exists)
    .ok();

  await checkA11y(t);

  await assertRedirectionToAuthenticatorList(t);
});
