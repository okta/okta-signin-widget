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
import { getUIElementWithName } from '../utils';

export const transformPhoneEnrollment: IdxStepTransformer = ({ formBag }) => {
  const { uischema, data } = formBag;

  uischema.elements = uischema.elements.map((element) => {
    const controlElement = element as FieldElement;
    if (controlElement.name === 'authenticator.phoneNumber') {
      return {
        ...controlElement,
        label: 'mfa.phoneNumber.placeholder',
        options: {
          ...controlElement.options,
          targetKey: 'authenticator.methodType',
        },
      };
    }
    return controlElement;
  });

  const titleElement: TitleElement = {
    type: 'Title',
    options: {
      content: 'oie.phone.enroll.title',
    },
  };

  const methodTypeElement = getUIElementWithName('authenticator.methodType', uischema.elements) as FieldElement;
  methodTypeElement.options = {
    ...methodTypeElement.options,
    format: 'radio',
  };
  data['authenticator.methodType'] = methodTypeElement!.options!.inputMeta.options![0].value;

  const phoneNumberElement = getUIElementWithName('authenticator.phoneNumber', uischema.elements) as FieldElement;
  phoneNumberElement.label = 'mfa.phoneNumber.placeholder';
  phoneNumberElement.options = {
    ...phoneNumberElement.options,
    targetKey: 'authenticator.methodType',
  };

  const voiceInfoTextElement: DescriptionElement = {
    type: 'Description',
    options: {
      content: 'oie.phone.enroll.call.subtitle',
    },
  };

  const smsInfoTextElement: DescriptionElement = {
    type: 'Description',
    options: {
      content: 'oie.phone.enroll.sms.subtitle',
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
            label: 'oie.phone.sms.primaryButton',
            scope: `#/properties/${ButtonType.SUBMIT}`,
            options: {
              type: ButtonType.SUBMIT,
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
            label: 'oie.phone.call.primaryButton',
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
    stepper,
  ];

  return formBag;
};
