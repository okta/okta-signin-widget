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

import { loc } from 'okta';
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

export const transformGoogleAuthenticatorEnroll: IdxStepTransformer = ({
  transaction,
  formBag,
}) => {
  const { nextStep: { relatesTo } = {} } = transaction;

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
      content: loc('oie.enroll.google_authenticator.setup.title', 'login'),
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

  const stepOneStepperButton: StepperButtonElement = {
    type: 'StepperButton',
    label: loc('oie.enroll.google_authenticator.cannotScanBarcode.title', 'login'),
    options: {
      type: ButtonType.BUTTON,
      variant: 'secondary',
      nextStepIndex: 1,
    },
  };

  const nextButton: StepperButtonElement = {
    type: 'StepperButton',
    label: loc('oform.next', 'login'),
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
              content: loc('oie.enroll.google_authenticator.scanBarcode.description', 'login'),
            },
          } as DescriptionElement,
          qrCodeElement,
          stepOneStepperButton,
          nextButton,
        ],
      },
      {
        type: UISchemaLayoutType.VERTICAL,
        elements: [
          {
            type: 'Description',
            options: {
              content: loc('oie.enroll.google_authenticator.manualSetupInstructions', 'login'),
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
            options: { content: loc('oie.enroll.google_authenticator.enterCode.title', 'login') },
          } as DescriptionElement,
          passcodeElement,
          {
            type: 'Button',
            label: loc('oform.verify', 'login'),
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
