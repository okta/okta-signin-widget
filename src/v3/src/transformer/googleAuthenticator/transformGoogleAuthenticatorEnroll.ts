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

import {
  ButtonElement,
  ButtonType,
  DescriptionElement,
  FieldElement,
  IdxStepTransformer,
  QRCodeElement,
  StepperButtonElement,
  StepperLayout,
  TitleElement,
  UISchemaElement,
  UISchemaLayoutType,
} from '../../types';
import { getUIElementWithName } from '../utils';

export const transformGoogleAuthenticatorEnroll: IdxStepTransformer = (transaction, formBag) => {
  const { nextStep: { relatesTo } } = transaction;

  if (!relatesTo || !relatesTo.value?.contextualData?.qrcode) {
    // N/A for this transformer
    return formBag;
  }

  const { href } = relatesTo.value.contextualData.qrcode;
  const { displayName } = relatesTo.value;

  const { uischema } = formBag;

  const passcodeElement = getUIElementWithName(
    'credentials.passcode',
    uischema.elements as UISchemaElement[],
  ) as FieldElement;

  const titleElement: TitleElement = {
    type: 'Title',
    options: {
      content: 'oie.enroll.google_authenticator.setup.title',
    },
  };

  const manualKeyElement: DescriptionElement = {
    type: 'Description',
    options: {
      // spacing out the code so Screen reader can speak each letter individually
      content: relatesTo.value.contextualData.sharedSecret?.split('').join(' ') || '',
    },
  };

  const qrCodeElement: QRCodeElement = {
    type: 'QRCode',
    options: { label: displayName, data: href },
  };

  const nextButton: StepperButtonElement = {
    type: 'StepperButton',
    label: 'oform.next',
    options: {
      type: ButtonType.BUTTON,
      variant: 'primary',
      nextStepIndex: 2,
    },
  };

  const googleAuthStepper: StepperLayout = {
    type: UISchemaLayoutType.STEPPER,
    elements: [
      {
        type: UISchemaLayoutType.VERTICAL,
        elements: [
          {
            type: 'Description',
            options: {
              content: 'oie.enroll.google_authenticator.scanBarcode.description',
            },
          } as DescriptionElement,
          qrCodeElement,
          {
            type: 'StepperButton',
            label: 'renderers.qrcode.setUpDifferentWay',
            options: {
              variant: 'secondary',
              nextStepIndex: 1,
            },
          } as StepperButtonElement,
          nextButton,
        ],
      },
      {
        type: UISchemaLayoutType.VERTICAL,
        elements: [
          {
            type: 'Description',
            options: {
              content: 'oie.enroll.google_authenticator.manualSetupInstructions',
            },
          } as DescriptionElement,
          manualKeyElement,
          nextButton,
        ],
      },
      {
        type: UISchemaLayoutType.VERTICAL,
        elements: [
          {
            type: 'Description',
            options: { content: 'oie.enroll.google_authenticator.enterCode.title' },
          } as DescriptionElement,
          passcodeElement,
          {
            type: 'Button',
            label: 'mfa.challenge.verify',
            scope: `#/properties/${ButtonType.SUBMIT}`,
            options: {
              type: ButtonType.SUBMIT,
            },
          } as ButtonElement,
        ],
      },
    ],

  };

  uischema.elements = [
    titleElement,
    googleAuthStepper,
  ];

  return formBag;
};
