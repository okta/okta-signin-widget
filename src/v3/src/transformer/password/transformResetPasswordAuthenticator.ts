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
  IdxStepTransformer,
  TitleElement,
} from '../../types';
import { loc } from '../../util';
import { transformEnrollPasswordAuthenticator } from './transformEnrollPasswordAuthenticator';

const getContentTitleAndParams = (brandName?: string): TitleElement['options'] => {
  if (brandName) {
    return { content: loc('password.reset.title.specific', 'login', [brandName]) };
  }
  return { content: loc('password.reset.title.generic', 'login') };
};

export const transformResetPasswordAuthenticator: IdxStepTransformer = ({
  transaction,
  formBag,
  widgetProps,
}) => {
  const { brandName } = widgetProps;

  const baseFormBag = transformEnrollPasswordAuthenticator({ transaction, formBag, widgetProps });
  const { uischema } = baseFormBag;

  const titleElement: TitleElement = {
    type: 'Title',
    options: getContentTitleAndParams(brandName),
  };

  const submitBtnElement: ButtonElement = {
    type: 'Button',
    label: loc('password.reset', 'login'),
    options: {
      type: ButtonType.SUBMIT,
      step: transaction.nextStep!.name,
    },
  };

  // Replace default (enrollment) title with reset title
  uischema.elements.splice(0, 1, titleElement);
  uischema.elements.push(submitBtnElement);

  return baseFormBag;
};
