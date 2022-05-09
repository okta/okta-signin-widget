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

import { ControlElement } from '@jsonforms/core';

import {
  DescriptionElement,
  IdxStepTransformer,
  TitleElement,
} from '../../types';
import { ButtonOptionType } from '../getButtonControls';
import { getUIElementWithScope } from '../utils';

const TARGET_FIELD_NAME = 'methodType';

export const transformEmailVerification: IdxStepTransformer = (transaction, formBag) => {
  const { nextStep } = transaction;
  const { uischema, data } = formBag;

  // Find methodType option, set first as selected, and hide element
  const methodTypeElement = getUIElementWithScope(
    `#/properties/${TARGET_FIELD_NAME}`,
    uischema.elements as ControlElement[],
  );
  if (methodTypeElement) {
    data[TARGET_FIELD_NAME] = methodTypeElement.options?.choices[0]?.key;
    methodTypeElement.options = {
      ...methodTypeElement.options,
      type: 'hidden',
    };
  }

  const titleElement: TitleElement = {
    type: 'Title',
    options: {
      content: 'oie.email.mfa.title',
    },
  };

  // @ts-ignore OKTA-483184 (profile missing from authenticator interface)
  const redactedEmailAddress = nextStep.authenticator?.profile?.email;
  const informationalText: DescriptionElement = {
    type: 'Description',
    options: {
      content: redactedEmailAddress
        ? 'next.email.verify.subtitleWithEmailAddress'
        : 'next.email.verify.subtitleWithoutEmailAddress',
      contentParams: [
        redactedEmailAddress,
      ],
    },
  };

  const submitButtonControl: ControlElement = {
    type: 'Control',
    label: 'oie.email.verify.primaryButton',
    scope: `#/properties/${ButtonOptionType.SUBMIT}`,
    options: {
      format: 'button',
      type: ButtonOptionType.SUBMIT,
      idxMethod: 'proceed',
    },
  };

  // Title -> Descr -> Button
  uischema.elements.unshift(informationalText);
  uischema.elements.unshift(titleElement);
  uischema.elements.push(submitButtonControl);

  return formBag;
};
