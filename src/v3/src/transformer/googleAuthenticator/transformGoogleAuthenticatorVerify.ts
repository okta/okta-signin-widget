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

import { loc } from 'okta';
import {
  ButtonElement,
  ButtonType,
  DescriptionElement,
  IdxStepTransformer,
  TitleElement,
} from '../../types';

export const transformGoogleAuthenticatorVerify: IdxStepTransformer = ({ formBag }) => {
  const { uischema } = formBag;

  const titleElement: TitleElement = {
    type: 'Title',
    options: {
      content: loc('oie.verify.google_authenticator.otp.title', 'login'),
    },
  };
  const informationalText: DescriptionElement = {
    type: 'Description',
    options: {
      content: loc('oie.verify.google_authenticator.otp.description', 'login'),
    },
  };
  const submitButtonElement: ButtonElement = {
    type: 'Button',
    label: loc('mfa.challenge.verify', 'login'),
    scope: `#/properties/${ButtonType.SUBMIT}`,
    options: {
      type: ButtonType.SUBMIT,
    },
  };

  // Title -> Descr -> Submit
  uischema.elements.unshift(informationalText);
  uischema.elements.unshift(titleElement);
  uischema.elements.push(submitButtonElement);

  return formBag;
};
