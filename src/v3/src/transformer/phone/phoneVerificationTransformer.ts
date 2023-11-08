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

import { NextStep } from '@okta/okta-auth-js';
import { IdxOption } from '@okta/okta-auth-js/types/lib/idx/types/idx-js';

import {
  ButtonElement,
  ButtonType,
  DescriptionElement,
  FieldElement,
  IdxStepTransformer,
  TitleElement,
  UISchemaElement,
} from '../../types';
import { buildPhoneVerificationSubtitleElement, isValidPhoneMethodType, loc } from '../../util';
import { getUIElementWithName, removeUIElementWithName } from '../utils';

const TARGET_FIELD_NAME = 'authenticator.methodType';

export const transformPhoneVerification: IdxStepTransformer = ({ transaction, formBag }) => {
  const { nextStep = {} as NextStep } = transaction;
  const { name: step } = nextStep;
  const { uischema } = formBag;

  // Find methodType option, set first as selected, and hide element
  const methodTypeElement = getUIElementWithName(
    TARGET_FIELD_NAME,
    uischema.elements as UISchemaElement[],
  ) as FieldElement;
  const primaryMethod = methodTypeElement?.options.inputMeta?.options?.[0].value;
  const hasMultipleMethods = (
    methodTypeElement?.options?.inputMeta?.options as IdxOption[]
  ).length > 1;
  if (methodTypeElement) {
    uischema.elements = removeUIElementWithName(
      TARGET_FIELD_NAME,
      uischema.elements as UISchemaElement[],
    );
  }

  const carrierInfoText: DescriptionElement = {
    type: 'Description',
    contentType: 'subtitle',
    options: {
      content: loc('oie.phone.carrier.charges', 'login'),
    },
  };
  // (Display order) 3rd element in the elements array
  uischema.elements.unshift(carrierInfoText);

  // (Display order) 2nd element in the elements array
  // Append appropriate descr text to elements based on first methodType
  if (isValidPhoneMethodType(primaryMethod)) {
    uischema.elements.unshift(
      buildPhoneVerificationSubtitleElement(
        nextStep.name,
        primaryMethod,
        nextStep.relatesTo?.value,
      ),
    );
  }

  const titleElement: TitleElement = {
    type: 'Title',
    options: {
      content: loc('oie.phone.verify.title', 'login'),
    },
  };
  // (Display order) 1st element in the elements array
  uischema.elements.unshift(titleElement);

  const primaryButton: ButtonElement = {
    type: 'Button',
    label: primaryMethod === 'sms'
      ? loc('oie.phone.sms.primaryButton', 'login')
      : loc('oie.phone.call.primaryButton', 'login'),
    options: {
      type: ButtonType.SUBMIT,
      actionParams: {
        'authenticator.methodType': methodTypeElement?.options.inputMeta?.options?.[0].value as string,
      },
      step,
    },
  };

  const secondaryButton: ButtonElement = {
    type: 'Button',
    label: primaryMethod === 'sms'
      ? loc('oie.phone.call.secondaryButton', 'login')
      : loc('oie.phone.sms.secondaryButton', 'login'),
    options: {
      type: ButtonType.BUTTON,
      variant: 'secondary',
      actionParams: {
        'authenticator.methodType': methodTypeElement?.options.inputMeta?.options?.[1]?.value as string,
      },
      step,
    },
  };

  // (Display order) 4th element in the elements array
  // Append buttons to end of elements array
  uischema.elements.push(primaryButton);
  if (hasMultipleMethods) {
    uischema.elements.push(secondaryButton);
  }

  return formBag;
};
