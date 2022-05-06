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
import { DescriptionElement, IdxStepTransformer, TitleElement } from 'src/types';

import { ButtonOptionType } from '../getButtonControls';

export const transformPhoneCodeEnrollment: IdxStepTransformer = (transaction, formBag) => {
  const { nextStep: { authenticator } } = transaction;
  const { uischema } = formBag;

  const titleElement: TitleElement = {
    type: 'Title',
    options: {
      content: 'oie.phone.enroll.title',
    },
  };

  const informationalTextElement: DescriptionElement = {
    type: 'Description',
    options: {
      content: authenticator?.methods[0]?.type === 'sms'
        ? 'next.phone.verify.sms.codeSentText'
        : 'next.phone.verify.voice.calling',
    },
  };

  const carrierChargeDisclaimerText: DescriptionElement = {
    type: 'Description',
    options: {
      content: 'oie.phone.carrier.charges',
    },
  };

  const submitButton: ControlElement = {
    type: 'Control',
    label: 'mfa.challenge.verify',
    scope: `#/properties/${ButtonOptionType.SUBMIT}`,
    options: {
      format: 'button',
      type: ButtonOptionType.SUBMIT,
    },
  };

  // Element order matters for display purposes:
  // 1. Title 2. Description ... Button is last element
  uischema.elements.unshift(carrierChargeDisclaimerText);
  uischema.elements.unshift(informationalTextElement);
  uischema.elements.unshift(titleElement);
  uischema.elements.push(submitButton);

  return formBag;
};
