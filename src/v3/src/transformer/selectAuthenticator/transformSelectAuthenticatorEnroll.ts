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
  UISchemaElement,
} from '../../types';
import { removeUIElementWithName } from '../utils';
import { getAuthenticatorEnrollButtonElements } from './utils';

const getContentDescrAndParams = (brandName?: string): TitleElement['options'] => {
  if (brandName) {
    return {
      content: loc('oie.select.authenticators.enroll.subtitle.custom', 'login', [brandName]),
    };
  }
  return { content: loc('oie.select.authenticators.enroll.subtitle', 'login') };
};

export const transformSelectAuthenticatorEnroll: IdxStepTransformer = (
  transaction,
  formBag,
  widgetProps,
) => {
  const { brandName } = widgetProps;
  const { nextStep: { inputs, canSkip }, availableSteps } = transaction;
  const authenticator = inputs?.find(({ name }) => name === 'authenticator');
  if (!authenticator?.options) {
    return formBag;
  }

  const { uischema } = formBag;

  const authenticatorButtonElements = getAuthenticatorEnrollButtonElements(authenticator.options);
  uischema.elements = removeUIElementWithName(
    'authenticator',
    uischema.elements as UISchemaElement[],
  );
  uischema.elements.push({
    type: 'Description',
    options: {
      content: canSkip ? loc('oie.setup.optional', 'login') : loc('oie.setup.required', 'login'),
    },
  } as DescriptionElement);
  uischema.elements = uischema.elements.concat(authenticatorButtonElements);

  const titleElement: TitleElement = {
    type: 'Title',
    options: {
      content: loc('oie.select.authenticators.enroll.title', 'login'),
    },
  };
  const informationalTextElement: DescriptionElement = {
    type: 'Description',
    options: getContentDescrAndParams(brandName),
  };

  uischema.elements.unshift(informationalTextElement);
  uischema.elements.unshift(titleElement);

  const skipStep = availableSteps?.find(({ name }) => name === 'skip');
  if (canSkip && skipStep) {
    const { name: step } = skipStep;
    const skipButtonElement: ButtonElement = {
      type: 'Button',
      label: loc('oie.optional.authenticator.button.title', 'login'),
      scope: `#/properties/${ButtonType.SUBMIT}`,
      options: {
        type: ButtonType.SUBMIT,
        step,
      },
    };
    uischema.elements.push(skipButtonElement);
  }

  return formBag;
};
