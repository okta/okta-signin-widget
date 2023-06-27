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
  TitleElement,
} from '../../../types';
import { loc } from '../../../util';
import { getUIElementWithName } from '../../utils';

export const transformGoogleAuthenticatorVerify: IdxStepTransformer = ({
  formBag,
  transaction,
}) => {
  const { uischema } = formBag;

  const titleElement: TitleElement = {
    type: 'Title',
    options: {
      content: loc('oie.verify.google_authenticator.otp.title', 'login'),
    },
  };
  const informationalText: DescriptionElement = {
    type: 'Description',
    contentType: 'subtitle',
    options: {
      content: loc('oie.verify.google_authenticator.otp.description', 'login'),
    },
  };
  const passcodeElement: FieldElement = getUIElementWithName(
    'credentials.passcode',
    uischema.elements,
  ) as FieldElement;
  const submitButtonElement: ButtonElement = {
    type: 'Button',
    label: loc('mfa.challenge.verify', 'login'),
    options: {
      type: ButtonType.SUBMIT,
      step: transaction.nextStep!.name,
    },
  };

  uischema.elements = [
    titleElement,
    informationalText,
    passcodeElement,
    submitButtonElement,
  ];

  return formBag;
};
