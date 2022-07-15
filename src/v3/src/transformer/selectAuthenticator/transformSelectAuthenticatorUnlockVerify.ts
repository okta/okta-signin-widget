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

import {
  IdxStepTransformer,
  TitleElement,
  UISchemaElement,
} from '../../types';
import { removeUIElementWithName } from '../utils';
import { getAuthenticatorVerifyButtonElements } from './utils';

export const transformSelectAuthenticatorUnlockVerify: IdxStepTransformer = ({
  transaction,
  formBag,
}) => {
  const { nextStep: { inputs } = {} as NextStep } = transaction;
  const authenticator = inputs?.find(({ name }) => name === 'authenticator');
  if (!authenticator?.options) {
    return formBag;
  }

  const { uischema } = formBag;

  const authenticatorButtonElements = getAuthenticatorVerifyButtonElements(authenticator.options);
  uischema.elements = removeUIElementWithName(
    'authenticator',
    uischema.elements as UISchemaElement[],
  );
  uischema.elements = uischema.elements.concat(authenticatorButtonElements);

  const titleElement: TitleElement = {
    type: 'Title',
    options: {
      content: 'unlockaccount',
    },
  };
  uischema.elements.unshift(titleElement);

  return formBag;
};
