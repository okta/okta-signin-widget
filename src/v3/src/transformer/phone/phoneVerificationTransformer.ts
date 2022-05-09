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
} from '@jsonforms/core';
import { DescriptionElement, IdxStepTransformer, TitleElement } from 'src/types';

import { ButtonOptionType } from '../getButtonControls';
import { getUIElementWithScope, removeUIElementWithScope } from '../utils';

const TARGET_FIELD_NAME = 'methodType';
const TARGET_FIELD_SCOPE = `#/properties/${TARGET_FIELD_NAME}`;

export const transformPhoneVerification: IdxStepTransformer = (transaction, formBag) => {
  const { nextStep } = transaction;
  const { uischema, data } = formBag;

  // Find methodType option, set first as selected, and hide element
  const methodTypeElement = getUIElementWithScope(
    TARGET_FIELD_SCOPE,
    uischema.elements as ControlElement[],
  );
  const primaryMethod = methodTypeElement?.options?.choices[0]?.key;
  const hasMultipleMethods = methodTypeElement?.options?.choices.length > 1;
  if (methodTypeElement) {
    // Arbitrarily setting methodType, but this does not matter,
    // as the type will be reset based on the button the user clicks
    data[TARGET_FIELD_NAME] = primaryMethod;
    uischema.elements = removeUIElementWithScope(
      TARGET_FIELD_SCOPE,
      uischema.elements as ControlElement[],
    );
  }

  const carrierInfoText: DescriptionElement = {
    type: 'Description',
    options: {
      content: 'oie.phone.carrier.charges',
    },
  };
  // (Display order) 3rd element in the elements array
  uischema.elements.unshift(carrierInfoText);

  // @ts-ignore OKTA-483184 (profile missing from authenticator interface)
  const redactedPhoneNumber = nextStep.authenticator?.profile?.phoneNumber;
  const smsInfoTextElement: DescriptionElement = {
    type: 'Description',
    options: {
      content: redactedPhoneNumber
        ? 'next.phone.verify.sms.sendText.withPhoneNumber'
        : 'next.phone.verify.sms.sendText.withoutPhoneNumber',
      contentParams: [
        redactedPhoneNumber,
      ],
    },
  };
  const phoneInfoTextElement: DescriptionElement = {
    type: 'Description',
    options: {
      content: redactedPhoneNumber
        ? 'next.phone.verify.call.sendText.withPhoneNumber'
        : 'next.phone.verify.call.sendText.withoutPhoneNumber',
      contentParams: [
        redactedPhoneNumber,
      ],
    },
  };

  // (Display order) 2nd element in the elements array
  // Append appropriate descr text to elements based on first methodType
  if (primaryMethod === 'sms') {
    uischema.elements.unshift(smsInfoTextElement);
  } else {
    uischema.elements.unshift(phoneInfoTextElement);
  }

  const titleElement: TitleElement = {
    type: 'Title',
    options: {
      content: 'oie.phone.verify.title',
    },
  };
  // (Display order) 1st element in the elements array
  uischema.elements.unshift(titleElement);

  const primaryButton: ControlElement = {
    type: 'Control',
    label: primaryMethod === 'sms'
      ? 'oie.phone.sms.primaryButton'
      : 'oie.phone.call.primaryButton',
    scope: `#/properties/${ButtonOptionType.SUBMIT}`,
    options: {
      format: 'button',
      type: ButtonOptionType.SUBMIT,
      idxMethod: 'proceed',
      idxMethodParams: {
        [TARGET_FIELD_NAME]: methodTypeElement?.options?.choices[0]?.key,
      },
    },
  };

  const secondaryButton: ControlElement = {
    type: 'Control',
    label: primaryMethod === 'sms'
      ? 'oie.phone.call.secondaryButton'
      : 'oie.phone.sms.secondaryButton',
    scope: `#/properties/${ButtonOptionType.SUBMIT}`,
    options: {
      format: 'button',
      type: ButtonOptionType.SUBMIT,
      variant: 'clear',
      idxMethod: 'proceed',
      idxMethodParams: {
        [TARGET_FIELD_NAME]: methodTypeElement?.options?.choices[1]?.key,
      },
    },
  };

  // (Display order) 4th element in the elements array
  // Append buttons to end of elements array
  if (hasMultipleMethods) {
    uischema.elements.push(primaryButton);
    uischema.elements.push(secondaryButton);
  } else {
    uischema.elements.push(primaryButton);
  }

  return formBag;
};
