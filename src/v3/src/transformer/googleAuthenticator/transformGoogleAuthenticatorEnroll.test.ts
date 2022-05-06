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

import { ControlElement, Layout } from '@jsonforms/core';
import { IDX_STEP } from 'src/constants';
import { getStubTransactionWithNextStep } from 'src/mocks/utils/utils';
import { FormBag, LayoutType, StepperLayout } from 'src/types';

import { ButtonOptionType } from '../getButtonControls';
import { transformGoogleAuthenticatorEnroll } from '.';

describe('Google Authenticator Enroll Transformer Tests', () => {
  const transaction = getStubTransactionWithNextStep();
  let formBag: FormBag;
  beforeEach(() => {
    formBag = {
      envelope: {},
      data: {},
      schema: {},
      uischema: {
        type: 'VerticalLayout',
        elements: [{ type: 'Control', scope: '#/properties/verificationCode' } as ControlElement],
      },
    };
  });

  it('should not modify formBag when Idx response does not include QR Code', () => {
    transaction.nextStep = {
      name: IDX_STEP.ENROLL_AUTHENTICATOR,
    };
    expect(transformGoogleAuthenticatorEnroll(transaction, formBag)).toBe(formBag);
  });

  it('should add Stepper layout to UI Schema elements '
    + 'when GA Enroll params exists in Idx response', () => {
    transaction.nextStep = {
      name: IDX_STEP.ENROLL_AUTHENTICATOR,
      authenticator: {
        displayName: 'google auth',
        id: '',
        key: 'google_otp',
        methods: [],
        type: '',
        contextualData: {
          sharedSecret: 'ABC123DEF456',
          qrcode: {
            href: '#mockhref',
            method: 'mockmethod',
            type: 'mocktype',
          },
        },
      },
    };
    const updatedFormBag = transformGoogleAuthenticatorEnroll(transaction, formBag);

    const stepperElements = (updatedFormBag.uischema.elements[0] as StepperLayout).elements;
    expect(updatedFormBag.uischema.elements.length).toBe(1);
    expect(stepperElements.length).toBe(2);
    expect(stepperElements[0].type).toBe(LayoutType.STEPPER);
    expect(stepperElements[0].options?.navButtonsConfig?.next?.variant).toBe('clear');

    expect(
      (stepperElements[0] as StepperLayout).elements[0].type,
    ).toBe(LayoutType.VERTICAL);
    expect(
      ((stepperElements[0] as StepperLayout)
        .elements[0] as Layout).elements.length,
    ).toBe(3);
    // Verify 1st step elements
    expect(((stepperElements[0] as Layout).elements[0] as Layout).elements[0].type).toBe('Title');
    expect(((stepperElements[0] as Layout).elements[0] as Layout).elements[1].type)
      .toBe('Description');
    expect(((stepperElements[0] as Layout).elements[0] as Layout).elements[2].options?.format)
      .toBe('qrcode');
    // Verify 1st sub step elements
    expect(((stepperElements[0] as Layout).elements[1] as Layout).elements[0].type).toBe('Title');
    expect(((stepperElements[0] as Layout).elements[1] as Layout).elements[1].type)
      .toBe('Description');
    expect(((stepperElements[0] as Layout).elements[1] as Layout).elements[2].type)
      .toBe('Description');
    // Verify 2nd step elements
    expect(
      (stepperElements[1] as Layout).elements.length,
    ).toBe(4);
    expect(
      (stepperElements[1] as Layout).elements[0]
        .type,
    ).toBe('Title');
    expect(
      (stepperElements[1] as Layout).elements[1]
        .type,
    ).toBe('Description');
    expect(
      (stepperElements[1] as Layout).elements[2].type,
    ).toBe('Control');
    expect(
      (stepperElements[1] as Layout).elements[3]
        .options?.type,
    ).toBe(ButtonOptionType.SUBMIT);
  });
});
