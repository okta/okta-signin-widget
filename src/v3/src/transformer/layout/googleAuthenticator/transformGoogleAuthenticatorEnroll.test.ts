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

import { IDX_STEP } from 'src/constants';
import { getStubFormBag, getStubTransactionWithNextStep } from 'src/mocks/utils/utils';
import {
  ButtonElement,
  ButtonType,
  DescriptionElement,
  FieldElement,
  FormBag,
  HeadingElement,
  QRCodeElement,
  StepperButtonElement,
  StepperLayout,
  TitleElement,
  WidgetProps,
} from 'src/types';
import { WidgetHooks } from 'src/util';
import { TinyEmitter } from 'tiny-emitter';

import { transformGoogleAuthenticatorEnroll } from '.';

describe('Google Authenticator Enroll Transformer Tests', () => {
  const transaction = getStubTransactionWithNextStep();
  const widgetProps: WidgetProps = {
    eventEmitter: null as unknown as TinyEmitter,
    widgetHooks: null as unknown as WidgetHooks,
  };
  const formBag: FormBag = getStubFormBag();

  function validateForm(updatedFormBag: FormBag) {
    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(2);
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options.content)
      .toBe('oie.enroll.google_authenticator.setup.title');

    const stepperLayout = updatedFormBag.uischema.elements[1] as StepperLayout;
    const [layoutOne, layoutTwo, layoutThree] = stepperLayout.elements;

    expect(layoutOne.elements.length).toBe(5);
    expect((layoutOne.elements[0] as HeadingElement).options.content)
      .toBe('oie.enroll.google_authenticator.scanBarcode.title');
    expect((layoutOne.elements[1] as DescriptionElement).options.content)
      .toBe('oie.enroll.google_authenticator.scanBarcode.description');
    expect((layoutOne.elements[2] as QRCodeElement).options.data)
      .toBe('#mockhref');
    expect((layoutOne.elements[3] as StepperButtonElement).label)
      .toBe('oie.enroll.google_authenticator.scanBarcode.cannotScan');
    expect((layoutOne.elements[3] as StepperButtonElement).options.nextStepIndex)
      .toBe(1);
    expect((layoutOne.elements[4] as StepperButtonElement).label)
      .toBe('oform.next');
    expect((layoutOne.elements[4] as StepperButtonElement).options.nextStepIndex)
      .toBe(2);

    expect(layoutTwo.elements.length).toBe(4);
    expect((layoutTwo.elements[0] as HeadingElement).options.content)
      .toBe('oie.enroll.google_authenticator.cannotScanBarcode.title');
    expect((layoutTwo.elements[1] as DescriptionElement).options.content)
      .toBe('oie.enroll.google_authenticator.manualSetupInstructions');
    expect((layoutTwo.elements[2] as DescriptionElement).options.content)
      .toBe('A B C 1 2 3 D E F 4 5 6');
    expect((layoutTwo.elements[3] as StepperButtonElement).label)
      .toBe('oform.next');
    expect((layoutTwo.elements[3] as StepperButtonElement).options.nextStepIndex)
      .toBe(2);

    expect(layoutThree.elements.length).toBe(3);
    expect((layoutThree.elements[0] as DescriptionElement).options.content)
      .toBe('oie.enroll.google_authenticator.enterCode.title');
    expect((layoutThree.elements[1] as FieldElement).options.inputMeta.name)
      .toBe('credentials.passcode');
    expect((layoutThree.elements[2] as ButtonElement).label)
      .toBe('oform.verify');
    expect((layoutThree.elements[2] as ButtonElement).options.type)
      .toBe(ButtonType.SUBMIT);
  }

  beforeEach(() => {
    formBag.uischema.elements = [
      {
        type: 'Field',
        options: { inputMeta: { name: 'credentials.passcode' } },
      } as FieldElement,
    ];
  });

  it('should not modify formBag when Idx response does not include QR Code', () => {
    transaction.nextStep = {
      name: IDX_STEP.ENROLL_AUTHENTICATOR,
    };
    expect(transformGoogleAuthenticatorEnroll({ transaction, formBag, widgetProps })).toBe(formBag);
  });

  it('should add Stepper layout to UI Schema elements '
    + 'when GA Enroll params exists in Idx response', () => {
    expect.hasAssertions();

    transaction.nextStep = {
      name: IDX_STEP.ENROLL_AUTHENTICATOR,
      relatesTo: {
        value: {
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
      },
    };
    const updatedFormBag = transformGoogleAuthenticatorEnroll({
      transaction, formBag, widgetProps,
    });

    validateForm(updatedFormBag);
  });

  it('should add Stepper layout to UI Schema elements '
    + 'when GA Reset params exists in Idx response', () => {
    expect.hasAssertions();

    transaction.nextStep = {
      name: IDX_STEP.RESET_AUTHENTICATOR,
      relatesTo: {
        value: {
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
      },
    };
    const updatedFormBag = transformGoogleAuthenticatorEnroll({
      transaction, formBag, widgetProps,
    });

    validateForm(updatedFormBag);
  });
});
