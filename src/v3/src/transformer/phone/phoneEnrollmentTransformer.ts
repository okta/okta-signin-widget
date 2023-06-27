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

import { IdxOption } from '@okta/okta-auth-js/types/lib/idx/types/idx-js';

import {
  ButtonElement,
  ButtonType,
  DescriptionElement,
  FieldElement,
  IdxStepTransformer,
  StepperLayout,
  StepperRadioElement,
  TitleElement,
  UISchemaElement,
  UISchemaLayoutType,
} from '../../types';
import { loc, removeFieldLevelMessages } from '../../util';
import { getUIElementWithName } from '../utils';

export const transformPhoneEnrollment: IdxStepTransformer = ({ formBag, transaction }) => {
  const { uischema, data, dataSchema } = formBag;

  const titleElement: TitleElement = {
    type: 'Title',
    options: {
      content: loc('oie.phone.enroll.title', 'login'),
    },
  };

  const METHOD_TYPE_KEY = 'authenticator.methodType';
  const methodTypeElement = getUIElementWithName(
    METHOD_TYPE_KEY,
    uischema.elements,
  ) as FieldElement;

  const phoneMethodStepper: StepperLayout = {
    type: UISchemaLayoutType.STEPPER,
    elements: [],
  };

  const phoneMethodOptions = methodTypeElement!.options!.inputMeta.options!
    .map((opt: IdxOption) => ({
      ...opt,
      label: loc(
        opt.value === 'sms' ? 'oie.phone.enroll.sms.label' : 'oie.phone.enroll.voice.label',
        'login',
      ),
    }));
  const methodTypeRadioEl: StepperRadioElement = {
    type: 'StepperRadio',
    options: {
      name: methodTypeElement!.options!.inputMeta.name,
      customOptions: phoneMethodOptions.map((option) => ({
        ...option,
        callback: (widgetContext, stepIndex) => {
          const { setData } = widgetContext;

          setData((prev) => ({
            ...prev,
            [METHOD_TYPE_KEY]: phoneMethodOptions[stepIndex].value,
          }));

          const stepLayout = phoneMethodStepper.elements[stepIndex];
          stepLayout.elements = removeFieldLevelMessages(stepLayout.elements);
        },
      })),
      defaultValue: (widgetContext, stepIndex) => {
        const { setData } = widgetContext;
        setData((prev) => ({
          ...prev,
          [METHOD_TYPE_KEY]: phoneMethodOptions[stepIndex].value,
        }));
        return phoneMethodOptions[0].value.toString();
      },
    },
  };

  const phoneNumberElement = getUIElementWithName('authenticator.phoneNumber', uischema.elements) as FieldElement;
  // TODO: Top level transformer (flattener logic) removes label so we have to add it here manually
  phoneNumberElement.label = loc('mfa.phoneNumber.placeholder', 'login');

  const voiceInfoTextElement: DescriptionElement = {
    type: 'Description',
    contentType: 'subtitle',
    options: {
      content: loc('oie.phone.enroll.call.subtitle', 'login'),
    },
  };

  const smsInfoTextElement: DescriptionElement = {
    type: 'Description',
    contentType: 'subtitle',
    options: {
      content: loc('oie.phone.enroll.sms.subtitle', 'login'),
    },
  };

  const smsStepSubmitButton: ButtonElement = {
    type: 'Button',
    label: loc('oie.phone.sms.primaryButton', 'login'),
    options: {
      type: ButtonType.SUBMIT,
      step: transaction.nextStep!.name,
    },
  };

  const voiceStepSubmitButton: ButtonElement = {
    type: 'Button',
    label: loc('oie.phone.call.primaryButton', 'login'),
    options: {
      type: ButtonType.SUBMIT,
      step: transaction.nextStep!.name,
    },
  };

  uischema.elements = [
    titleElement,
  ];

  if (phoneMethodOptions.length === 1) {
    const firstOptionMethod = phoneMethodOptions[0].value;
    data[METHOD_TYPE_KEY] = firstOptionMethod;
    if (firstOptionMethod === 'sms') {
      uischema.elements = uischema.elements.concat([
        smsInfoTextElement,
        phoneNumberElement,
        smsStepSubmitButton,
      ]);
    } else {
      uischema.elements = uischema.elements.concat([
        voiceInfoTextElement,
        phoneNumberElement,
        voiceStepSubmitButton,
      ]);
    }
  } else {
    phoneMethodStepper.elements = [
      {
        type: UISchemaLayoutType.VERTICAL,
        elements: [
          smsInfoTextElement,
          methodTypeRadioEl,
          phoneNumberElement,
          smsStepSubmitButton,
        ].map((ele: UISchemaElement) => ({ ...ele, viewIndex: 0 })),
      },
      {
        type: UISchemaLayoutType.VERTICAL,
        elements: [
          voiceInfoTextElement,
          methodTypeRadioEl,
          phoneNumberElement,
          voiceStepSubmitButton,
        ].map((ele: UISchemaElement) => ({ ...ele, viewIndex: 1 })),
      },
    ];

    uischema.elements.push(phoneMethodStepper);
  }

  // set default dataSchema
  dataSchema.submit = smsStepSubmitButton.options;

  return formBag;
};
