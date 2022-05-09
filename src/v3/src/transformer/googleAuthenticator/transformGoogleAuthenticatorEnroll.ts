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
  ControlElement,
  Layout,
} from '@jsonforms/core';

import {
  DescriptionElement,
  IdxStepTransformer,
  LayoutType,
  QRCodeElement,
  StepperLayout,
  StepperNavButtonConfigAttrs,
  StepperNavButtonConfigDirection,
  TitleElement,
} from '../../types';
import { ButtonOptionType } from '../getButtonControls';
import { getCurrentTimestamp, removeUIElementWithScope } from '../utils';

export const transformGoogleAuthenticatorEnroll: IdxStepTransformer = (transaction, formBag) => {
  const { nextStep: { authenticator } } = transaction;

  if (!authenticator || !authenticator.contextualData?.qrcode) {
    // N/A for this transformer
    return formBag;
  }

  const { href } = authenticator.contextualData.qrcode;
  const { displayName } = authenticator;

  const { uischema } = formBag;

  uischema.elements = removeUIElementWithScope(
    '#/properties/verificationCode',
    uischema.elements as ControlElement[],
  );

  const titleElement: TitleElement = {
    type: 'Title',
    options: {
      content: 'oie.enroll.google_authenticator.setup.title',
    },
  };

  const manualKeyElement: DescriptionElement = {
    type: 'Description',
    options: {
      content: authenticator.contextualData?.sharedSecret?.split('').join(' ') || '',
    },
  };

  const qrCodeElement: QRCodeElement = {
    type: 'QRCode',
    options: {
      label: displayName,
      data: href,
    },
  };

  const googleAuthStepper: StepperLayout = {
    type: LayoutType.STEPPER,
    elements: [
      {
        type: LayoutType.STEPPER,
        elements: [
          {
            type: LayoutType.VERTICAL,
            elements: [
              titleElement,
              {
                type: 'Description',
                options: {
                  content: 'oie.enroll.google_authenticator.scanBarcode.description',
                },
              },
              qrCodeElement,
            ],
          } as Layout,
          {
            type: LayoutType.VERTICAL,
            elements: [
              titleElement,
              {
                type: 'Description',
                options: {
                  content: 'oie.enroll.google_authenticator.manualSetupInstructions',
                },
              },
              manualKeyElement,
            ],
          },
        ],
        options: {
          key: `${getCurrentTimestamp()}-GAFlowChild`,
          navButtonsConfig: {
            next: {
              variant: 'clear',
              label: 'renderers.qrcode.setUpDifferentWay',
            },
          } as Record<StepperNavButtonConfigDirection, StepperNavButtonConfigAttrs>,
        },
      } as StepperLayout,
      {
        type: LayoutType.VERTICAL,
        elements: [
          titleElement,
          {
            type: 'Description',
            options: { content: 'oie.enroll.google_authenticator.enterCode.title' },
          },
          {
            type: 'Control',
            label: 'oie.google_authenticator.otp.enterCodeText',
            scope: '#/properties/verificationCode',
          },
          {
            type: 'Control',
            label: 'mfa.challenge.verify',
            scope: `#/properties/${ButtonOptionType.SUBMIT}`,
            options: {
              format: 'button',
              type: ButtonOptionType.SUBMIT,
            },
          } as ControlElement,
        ],
      } as Layout,
    ],
    options: {
      key: `${getCurrentTimestamp()}-GAflowParent`,
      navButtonsConfig: {
        next: {
          variant: 'primary',
          label: 'oform.next',
        },
      } as Record<StepperNavButtonConfigDirection, StepperNavButtonConfigAttrs>,
    },
  };
  // prepend stepper
  uischema.elements.unshift(googleAuthStepper);

  return formBag;
};
