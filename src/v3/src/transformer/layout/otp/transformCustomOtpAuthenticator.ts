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
  IdxStepTransformer,
  TitleElement,
} from '../../../types';
import { getDisplayName, loc } from '../../../util';

export const transformCustomOtpAuthenticator: IdxStepTransformer = ({
  transaction,
  formBag,
}) => {
  const { uischema } = formBag;
  const { nextStep: { name: step = '' } = {} } = transaction;

  const vendorName = getDisplayName(transaction)
    || loc('oie.custom_otp.authenticator.default.vendorName', 'login');
  const titleElement: TitleElement = {
    type: 'Title',
    options: { content: loc('oie.verify.custom_otp.title', 'login', [vendorName]) },
  };

  const subtitleElement: DescriptionElement = {
    type: 'Description',
    contentType: 'subtitle',
    options: {
      content: loc('oie.verify.custom_otp.description', 'login'),
    },
  };

  const submitBtnElement: ButtonElement = {
    type: 'Button',
    label: loc('mfa.challenge.verify', 'login'),
    options: {
      type: ButtonType.SUBMIT,
      step,
    },
  };

  uischema.elements.unshift(subtitleElement);
  uischema.elements.unshift(titleElement);
  uischema.elements.push(submitBtnElement);

  return formBag;
};
