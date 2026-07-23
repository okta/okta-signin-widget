/*
 * Copyright (c) 2026-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { IdxAuthenticator, IdxTransaction } from '@okta/okta-auth-js';
import { AUTHENTICATOR_KEY, IDX_STEP } from 'src/constants';
import { getStubFormBag, getStubTransactionWithNextStep } from 'src/mocks/utils/utils';
import { FieldElement, FormBag, WidgetProps } from 'src/types';

import { transformInputPassword } from './transformInputPassword';

const secretField = (name: string): FieldElement => ({
  type: 'Field',
  options: { inputMeta: { name, secret: true } },
} as unknown as FieldElement);

const getToggleLabelKey = (element: FieldElement): string | undefined => element.translations
  ?.find(({ name }) => name === 'visibilityToggleLabel')?.i18nKey;

const runTransform = (
  formBag: FormBag,
  transaction: IdxTransaction,
): FormBag => transformInputPassword({
  transaction,
  widgetProps: {} as WidgetProps,
  step: '',
  isClientTransaction: false,
  setMessage: () => {},
})(formBag);

describe('transformInputPassword visibility-toggle label selection', () => {
  let transaction: IdxTransaction;
  let formBag: FormBag;

  beforeEach(() => {
    transaction = getStubTransactionWithNextStep();
    formBag = getStubFormBag();
  });

  it('labels the confirm-password toggle "re-entered password"', () => {
    formBag.uischema.elements = [secretField('confirmPassword')];

    const [confirmField] = runTransform(formBag, transaction).uischema.elements as FieldElement[];
    expect(getToggleLabelKey(confirmField)).toBe('oie.password.showConfirmPassword');
  });

  it('labels the security-question answer toggle "answer"', () => {
    formBag.uischema.elements = [secretField('credentials.answer')];

    const [answerField] = runTransform(formBag, transaction).uischema.elements as FieldElement[];
    expect(getToggleLabelKey(answerField)).toBe('oie.challenge.answer.showAnswer');
  });

  it('labels the enroll password/confirm pair "password" and "re-entered password"', () => {
    formBag.uischema.elements = [
      secretField('credentials.passcode'),
      secretField('confirmPassword'),
    ];

    const [passcodeField, confirmField] = runTransform(formBag, transaction)
      .uischema.elements as FieldElement[];
    // Distinct names satisfy WCAG 2.4.6; the new-password field keeps the plain "Show password".
    expect(getToggleLabelKey(passcodeField)).toBe('oie.password.showPassword');
    expect(getToggleLabelKey(confirmField)).toBe('oie.password.showConfirmPassword');
  });

  it('labels the reset-password new-password toggle "new password"', () => {
    formBag.uischema.elements = [
      secretField('credentials.passcode'),
      secretField('confirmPassword'),
    ];
    transaction.nextStep = { name: IDX_STEP.RESET_AUTHENTICATOR };

    const [passcodeField, confirmField] = runTransform(formBag, transaction)
      .uischema.elements as FieldElement[];
    expect(getToggleLabelKey(passcodeField)).toBe('oie.password.showNewPassword');
    expect(getToggleLabelKey(confirmField)).toBe('oie.password.showConfirmPassword');
  });

  it('labels the YubiKey passcode toggle "YubiKey verification code"', () => {
    formBag.uischema.elements = [secretField('credentials.passcode')];
    transaction.nextStep = {
      name: IDX_STEP.ENROLL_AUTHENTICATOR,
      relatesTo: { type: '', value: { key: AUTHENTICATOR_KEY.YUBIKEY } as IdxAuthenticator },
    };

    const [passcodeField] = runTransform(formBag, transaction).uischema.elements as FieldElement[];
    expect(getToggleLabelKey(passcodeField)).toBe('oie.yubikey.passcode.show');
  });

  it('labels a sign-in password toggle "password" (no confirm field, not YubiKey)', () => {
    formBag.uischema.elements = [secretField('credentials.passcode')];
    transaction.nextStep = {
      name: IDX_STEP.CHALLENGE_AUTHENTICATOR,
      relatesTo: { type: '', value: { key: AUTHENTICATOR_KEY.PASSWORD } as IdxAuthenticator },
    };

    const [passcodeField] = runTransform(formBag, transaction).uischema.elements as FieldElement[];
    expect(getToggleLabelKey(passcodeField)).toBe('oie.password.showPassword');
  });
});
