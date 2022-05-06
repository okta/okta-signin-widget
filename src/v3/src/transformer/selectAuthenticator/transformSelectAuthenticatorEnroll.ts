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
import { IdxOption } from '@okta/okta-auth-js/lib/idx/types/idx-js';
import {
  DescriptionElement,
  IdxStepTransformer,
  IonFormField,
  TitleElement,
} from 'src/types';

import { ButtonOptionType } from '../getButtonControls';
import { removeUIElementWithScope } from '../utils';

export const transformSelectAuthenticatorEnroll: IdxStepTransformer = (transaction, formBag) => {
  const { nextStep } = transaction;
  const { options, canSkip } = nextStep;
  const { schema, uischema } = formBag;

  const inputs = (nextStep.inputs ?? []) as IonFormField[];
  schema.required = schema.required ?? [];

  inputs.filter((input) => input.name === 'authenticator').forEach((input) => {
    schema.properties = schema.properties ?? {};
    schema.properties[input.name] = {
      type: 'object',
      enum: options?.map((option: IdxOption) => ({
        label: option.label,
        value: {
          key: option.value,
          label: 'oie.enroll.authenticator.button.text',
        },
      })),
    };

    const targetScope = `#/properties/${input.name}`;
    uischema.elements = removeUIElementWithScope(
      targetScope,
      uischema.elements as ControlElement[],
    );
    uischema.elements.push({
      type: 'Control',
      scope: targetScope,
      label: canSkip ? 'oie.setup.optional' : 'oie.setup.required',
    } as ControlElement);
  });

  const titleElement: TitleElement = {
    type: 'Title',
    options: {
      content: 'oie.select.authenticators.enroll.title',
    },
  };
  const informationalTextElement: DescriptionElement = {
    type: 'Description',
    options: {
      // TODO: OKTA-486480 (Brand name can be configured here)
      content: 'oie.select.authenticators.enroll.subtitle',
    },
  };

  uischema.elements.unshift(informationalTextElement);
  uischema.elements.unshift(titleElement);

  if (canSkip) {
    const skipButtonElement: ControlElement = {
      type: 'Control',
      label: 'enroll.choices.submit.finish',
      scope: `#/properties/${ButtonOptionType.SUBMIT}`,
      options: {
        format: 'button',
        type: ButtonOptionType.SUBMIT,
        idxMethod: 'proceed',
        idxMethodParams: { skip: true },
      },
    };
    uischema.elements.push(skipButtonElement);
  }

  return formBag;
};
