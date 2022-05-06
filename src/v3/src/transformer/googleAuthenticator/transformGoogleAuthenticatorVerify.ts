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

import { DescriptionElement, IdxStepTransformer, TitleElement } from '../../types';
import { ButtonOptionType } from '../getButtonControls';

export const transformGoogleAuthenticatorVerify: IdxStepTransformer = (_, formBag) => {
  const { schema, uischema } = formBag;
  schema.properties = schema.properties ?? {};
  schema.required = schema.required ?? [];

  schema.properties = {
    ...schema.properties,
    [ButtonOptionType.SUBMIT]: {
      type: 'string',
    },
  };

  const titleElement: TitleElement = {
    type: 'Title',
    options: {
      content: 'oie.verify.google_authenticator.otp.title',
    },
  };
  const informationalText: DescriptionElement = {
    type: 'Description',
    options: {
      content: 'oie.verify.google_authenticator.otp.description',
    },
  };
  const submitButtonElement: ControlElement = {
    type: 'Control',
    label: 'mfa.challenge.verify',
    scope: `#/properties/${ButtonOptionType.SUBMIT}`,
    options: {
      format: 'button',
      type: ButtonOptionType.SUBMIT,
    },
  };

  // Title -> Descr -> Submit
  uischema.elements.unshift(informationalText);
  uischema.elements.unshift(titleElement);
  uischema.elements.push(submitButtonElement);

  return formBag;
};
