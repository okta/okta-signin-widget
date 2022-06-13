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
} from 'src/types';

import { ButtonOptionType } from '../getButtonControls';
import { removeUIElementWithScope } from '../utils';
import { getAuthenticatorEnrollOptions } from './utils';

const getContentDescrAndParams = (brandName?: string): TitleElement['options'] => {
  if (brandName) {
    return {
      content: 'oie.select.authenticators.enroll.subtitle.custom',
      contentParams: [brandName],
    };
  }
  return { content: 'oie.select.authenticators.enroll.subtitle' };
};

export const transformSelectAuthenticatorEnroll: IdxStepTransformer = (
  transaction,
  formBag,
  widgetProps,
) => {
  const { brandName } = widgetProps;
  const { nextStep: { inputs, canSkip }, availableSteps } = transaction;
  const authenticator = inputs?.find(({ name }) => name === 'authenticator');
  if (!authenticator || !authenticator.options) {
    return formBag;
  }

  const { schema, uischema } = formBag;

  schema.properties = schema.properties ?? {};
  schema.required = schema.required ?? [];

  schema.properties[authenticator.name] = {
    type: 'object',
    enum: getAuthenticatorEnrollOptions(authenticator.options),
  };

  const targetScope = `#/properties/${authenticator.name}`;
  uischema.elements = removeUIElementWithScope(
    targetScope,
    uischema.elements as ControlElement[],
  );
  uischema.elements.push({
    type: 'Control',
    scope: targetScope,
    label: canSkip ? 'oie.setup.optional' : 'oie.setup.required',
    options: {
      format: 'AuthenticatorList',
    },
  } as ControlElement);

  const titleElement: TitleElement = {
    type: 'Title',
    options: {
      content: 'oie.select.authenticators.enroll.title',
    },
  };
  const descrContentAndParams = getContentDescrAndParams(brandName);
  const informationalTextElement: DescriptionElement = {
    type: 'Description',
    options: {
      content: descrContentAndParams.content,
      contentParams: descrContentAndParams.contentParams,
    },
  };

  uischema.elements.unshift(informationalTextElement);
  uischema.elements.unshift(titleElement);

  const skipStep = availableSteps?.find(({ name }) => name === 'skip');
  if (canSkip && skipStep) {
    const { action } = skipStep;
    const skipButtonElement: ControlElement = {
      type: 'Control',
      label: 'enroll.choices.submit.finish',
      scope: `#/properties/${ButtonOptionType.SUBMIT}`,
      options: {
        format: 'button',
        idxMethodParams: { skip: true },
        action,
      },
    };
    uischema.elements.push(skipButtonElement);
  }

  return formBag;
};
