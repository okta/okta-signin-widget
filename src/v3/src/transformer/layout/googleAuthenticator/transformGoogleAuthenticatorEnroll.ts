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
  HeadingElement,
  IdxStepTransformer,
  QRCodeElement,
  StepperButtonElement,
  StepperLayout,
  TitleElement,
  UISchemaElement,
  UISchemaLayoutType,
} from '../../../types';
import { loc } from '../../../util';
import { getUIElementWithName } from '../../utils';

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
    contentType: 'subtitle',
    noTranslate: true,
    options: {
      // spacing out the code so Screen reader can speak each letter individually
      content: relatesTo.value.contextualData.sharedSecret?.split('').join(' ') || '',
    },
  };

  const qrCodeElement: QRCodeElement = {
    type: 'QRCode',
    options: { data: href },
  };

  const stepOneStepperButton: StepperButtonElement = {
    type: 'StepperButton',
    label: loc('oie.enroll.google_authenticator.scanBarcode.cannotScan', 'login'),
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
      // Initial Google Auth view w/ QR code scan
      {
        type: UISchemaLayoutType.VERTICAL,
        elements: [
          {
            type: 'Heading',
            contentType: 'subtitle',
            noMargin: true,
            options: {
              content: loc('oie.enroll.google_authenticator.scanBarcode.title', 'login'),
              level: 3,
              visualLevel: 5,
              dataSe: 'barcode-setup-title',
            },
          } as HeadingElement,
          {
            type: 'Description',
            contentType: 'subtitle',
            options: {
              content: loc('oie.enroll.google_authenticator.scanBarcode.description', 'login'),
              dataSe: 'google-authenticator-setup-info',
            },
          } as DescriptionElement,
          qrCodeElement,
          stepOneStepperButton,
          nextButton,
        ].map((ele: UISchemaElement) => ({ ...ele, viewIndex: 0 })),
      },
      // Manual entry view (after clicking "Can't scan?" link)
      {
        type: UISchemaLayoutType.VERTICAL,
        elements: [
          {
            type: 'Heading',
            contentType: 'subtitle',
            noMargin: true,
            options: {
              content: loc('oie.enroll.google_authenticator.cannotScanBarcode.title', 'login'),
              level: 3,
              visualLevel: 5,
              dataSe: 'manual-setup-title',
            },
          } as HeadingElement,
          {
            type: 'Description',
            contentType: 'subtitle',
            options: {
              content: loc('oie.enroll.google_authenticator.manualSetupInstructions', 'login'),
              dataSe: 'google-authenticator-setup-info',
            },
          } as DescriptionElement,
          manualKeyElement,
          nextButton,
        ].map((ele: UISchemaElement) => ({ ...ele, viewIndex: 1 })),
      },
      // Code entry view
      {
        type: UISchemaLayoutType.VERTICAL,
        elements: [
          {
            type: 'Description',
            contentType: 'subtitle',
            options: {
              content: loc('oie.enroll.google_authenticator.enterCode.title', 'login'),
              dataSe: 'enter-code-title',
            },
          } as DescriptionElement,
          passcodeElement,
          {
            type: 'Button',
            label: loc('oform.verify', 'login'),
            options: {
              type: ButtonType.SUBMIT,
              step: transaction.nextStep!.name,
            },
          } as ButtonElement,
        ].map((ele: UISchemaElement) => ({ ...ele, viewIndex: 2 })),
      },
    ],

  };

  uischema.elements = [
    titleElement,
    googleAuthStepper,
  ];

  return formBag;
};
