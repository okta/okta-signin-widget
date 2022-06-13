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
  RuleEffect,
  SchemaBasedCondition,
} from '@jsonforms/core';
import { DescriptionElement, IdxStepTransformer, TitleElement } from 'src/types';

import { ButtonOptionType } from '../getButtonControls';

const TARGET_FIELD_KEY = 'authenticator.methodType';
const METHOD_TYPE_SCOPE = '#/properties/authenticator/properties/methodType';
const PHONE_NUMBER_SCOPE = '#/properties/authenticator/properties/phoneNumber';

export const transformPhoneEnrollment: IdxStepTransformer = (_, formBag) => {
  const { uischema } = formBag;

  uischema.elements = uischema.elements.map((element) => {
    const controlElement = element as ControlElement;
    if (controlElement?.scope === METHOD_TYPE_SCOPE) {
      // Set the first value as the default for display
      return {
        ...controlElement,
        // Radio option does not have a label, just descriptive options
        label: '',
        options: {
          ...controlElement.options,
          defaultOption: controlElement.options?.choices[0]?.key,
        },
      };
    }
    if (controlElement.scope === PHONE_NUMBER_SCOPE) {
      return {
        ...controlElement,
        label: 'mfa.phoneNumber.placeholder',
        options: {
          ...controlElement.options,
          showExt: true,
          targetKey: TARGET_FIELD_KEY,
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

  const voiceCondition: SchemaBasedCondition = {
    scope: METHOD_TYPE_SCOPE,
    schema: {
      const: 'voice',
    },
  };
  const phoneInfoTextElement: DescriptionElement = {
    type: 'Description',
    options: {
      content: 'oie.phone.enroll.call.subtitle',
    },
    rule: {
      effect: RuleEffect.SHOW,
      condition: voiceCondition,
    },
  };

  const smsCondition: SchemaBasedCondition = {
    scope: METHOD_TYPE_SCOPE,
    schema: {
      const: 'sms',
    },
  };
  const smsInfoTextElement: DescriptionElement = {
    type: 'Description',
    options: {
      content: 'oie.phone.enroll.sms.subtitle',
    },
    rule: {
      effect: RuleEffect.SHOW,
      condition: smsCondition,
    },
  };

  const smsButton: ControlElement = {
    type: 'Control',
    label: 'oie.phone.sms.primaryButton',
    scope: `#/properties/${ButtonOptionType.SUBMIT}`,
    options: {
      format: 'button',
      type: ButtonOptionType.SUBMIT,
    },
    rule: {
      effect: RuleEffect.SHOW,
      condition: smsCondition,
    },
  };

  const voiceButton: ControlElement = {
    type: 'Control',
    label: 'oie.phone.call.primaryButton',
    scope: `#/properties/${ButtonOptionType.SUBMIT}`,
    options: {
      format: 'button',
      type: ButtonOptionType.SUBMIT,
    },
    rule: {
      effect: RuleEffect.SHOW,
      condition: voiceCondition,
    },
  };

  // Element order matters for display purposes:
  // 1. Title 2. Phone/SMS Info Text 3. Buttons
  uischema.elements.unshift(phoneInfoTextElement);
  uischema.elements.unshift(smsInfoTextElement);
  uischema.elements.unshift(titleElement);
  uischema.elements.push(smsButton);
  uischema.elements.push(voiceButton);

  return formBag;
};
