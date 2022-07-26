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

import { IdxTransaction, NextStep } from '@okta/okta-auth-js';
import {
  DescriptionElement,
  IdxStepTransformer,
  TitleElement,
  UISchemaElement,
} from 'src/types';

import { loc } from '../../util';
import { removeUIElementWithName } from '../utils';
import { getAuthenticatorVerifyButtonElements } from './utils';

const getContentTitleAndParams = (
  isPasswordRecovery: boolean,
  brandName?: string,
): TitleElement['options'] => {
  if (!isPasswordRecovery) {
    return { content: loc('oie.select.authenticators.verify.title', 'login') };
  }

  if (brandName) {
    return {
      content: loc('password.reset.title.specific', 'login', [brandName]),
    };
  }
  return { content: loc('password.reset.title.generic', 'login') };
};

const isPasswordRecovery = (transaction: IdxTransaction): boolean => (
  // @ts-ignore OKTA-486472 (prop is missing from interface)
  transaction.rawIdxState.recoveryAuthenticator?.value?.type === 'password'
);

export const transformSelectAuthenticatorVerify: IdxStepTransformer = ({
  transaction,
  formBag,
  widgetProps,
}) => {
  const { brandName } = widgetProps;
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

  const isPwRecovery = isPasswordRecovery(transaction);
  const titleElement: TitleElement = {
    type: 'Title',
    options: getContentTitleAndParams(isPwRecovery, brandName),
  };
  const informationalTextElement: DescriptionElement = {
    type: 'Description',
    options: {
      content: isPwRecovery
        ? loc('oie.password.reset.verification', 'login')
        : loc('oie.select.authenticators.verify.subtitle', 'login'),
    },
  };

  uischema.elements.unshift(informationalTextElement);
  uischema.elements.unshift(titleElement);

  return formBag;
};
