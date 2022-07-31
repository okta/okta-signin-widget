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
  StepperLayout,
  TitleElement,
  UISchemaLayoutType,
} from '../../types';
import { loc } from '../../util';
import { getUIElementWithName } from '../utils';

export const transformPhoneEnrollment: IdxStepTransformer = ({ formBag, transaction }) => {
  const { uischema, data } = formBag;

  const titleElement: TitleElement = {
    type: 'Title',
    options: {
      content: loc('oie.phone.enroll.title', 'login'),
    },
  };

  const methodTypeElement = getUIElementWithName('authenticator.methodType', uischema.elements) as FieldElement;
  methodTypeElement.options = {
    ...methodTypeElement.options,
    format: 'radio',
  };
  data['authenticator.methodType'] = methodTypeElement!.options!.inputMeta.options![0].value;

  const phoneNumberElement = getUIElementWithName('authenticator.phoneNumber', uischema.elements) as FieldElement;
  // TODO: Top level transformer (flattener logic) removes label so we have to add it here manually
  phoneNumberElement.label = loc('mfa.phoneNumber.placeholder', 'login');

  const voiceInfoTextElement: DescriptionElement = {
    type: 'Description',
    options: {
      content: loc('oie.phone.enroll.call.subtitle', 'login'),
    },
  };

  const smsInfoTextElement: DescriptionElement = {
    type: 'Description',
    options: {
      content: loc('oie.phone.enroll.sms.subtitle', 'login'),
    },
  };

  const stepper: StepperLayout = {
    type: UISchemaLayoutType.STEPPER,
    elements: [
      {
        type: UISchemaLayoutType.VERTICAL,
        elements: [
          smsInfoTextElement,
          methodTypeElement,
          phoneNumberElement,
          {
            type: 'Button',
            label: loc('oie.phone.sms.primaryButton', 'login'),
            scope: `#/properties/${ButtonType.SUBMIT}`,
            options: {
              type: ButtonType.SUBMIT,
              step: transaction.nextStep!.name,
            },
          } as ButtonElement,
        ],
      },
      {
        type: UISchemaLayoutType.VERTICAL,
        elements: [
          voiceInfoTextElement,
          methodTypeElement,
          phoneNumberElement,
          {
            type: 'Button',
            label: loc('oie.phone.call.primaryButton', 'login'),
            scope: `#/properties/${ButtonType.SUBMIT}`,
            options: {
              type: ButtonType.SUBMIT,
              step: transaction.nextStep!.name,
            },
          } as ButtonElement,
        ],
      },
    ],
  };

  uischema.elements = [
    titleElement,
    stepper,
  ];

  return formBag;
};
