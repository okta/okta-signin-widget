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
  JsonSchema7,
  UISchemaElement,
} from '@jsonforms/core';
import { IdxTransaction, Input } from '@okta/okta-auth-js';
import { FormBag } from 'src/types';

// TODO: auth-js types fix - OKTA-496979
// @ts-ignore
const mapOption = (option) => {
  const { label, value } = option;
  if (Array.isArray(value)) {
    return {
      const: (value as Input[])
        .reduce((acc, opt) => {
          (acc as any)[opt.name] = opt.value;
          return acc;
        }, {}),
      title: label,
    };
  }

  return { const: value, title: label };
};

const mapSchemaProperties = (input: Input): JsonSchema7['properties'] => {
  const properties: JsonSchema7['properties'] = {};
  const {
    name, value, type, options, mutable,
  } = input!;

  properties![name] = {
    type: type || 'string',
    ...(mutable === false && {
      const: value,
      mutable: false,
    }),
    ...(options && {
      oneOf: options.map((option) => mapOption(option)),
    }),
  };

  return properties;
};

const mapUiElements = (input: Input, stepName: string): UISchemaElement[] => {
  const elements: UISchemaElement[] = [];
  const { name, label } = input!;

  elements.push({
    type: 'Control',
    scope: `#/properties/${name}`,
    label,
    options: {
      id: `${stepName}.${name}`,
      ...input,
    },
  } as ControlElement);

  return elements;
};

const flattenInputs = (input: Input, name = ''): Input[] => {
  const res: Input[] = [];
  const { value } = input;

  if (Array.isArray(value)) {
    return value.reduce((acc, curr) => [
      ...acc,
      ...flattenInputs(curr, input.name),
    ], res);
  }

  return [{
    ...input,
    name: name ? `${name}.${input.name}` : input.name,
  }];
};

export const transformField = (transaction: IdxTransaction) => (formbag: FormBag): FormBag => {
  if (!transaction.nextStep) {
    return formbag;
  }

  const {
    name: stepName,
    inputs = [],
    relatesTo: {
      value: {
        contextualData,
      } = {},
    } = {},
  } = transaction.nextStep;

  if (contextualData) {
    formbag.uischema.elements.push({
      type: 'ContextualData',
      options: {
        contextualData,
      },
    });
  }

  return inputs
    .reduce((acc: Input[], input: Input) => {
      const flattenedInputs = flattenInputs(input);
      return [...acc, ...flattenedInputs];
    }, [])
    .reduce((acc: FormBag, input: Input) => {
      acc.schema.properties = { ...acc.schema.properties, ...mapSchemaProperties(input) };
      acc.schema.required = []; // TODO: add required array for client side validation
      acc.uischema.elements = [...acc.uischema.elements, ...mapUiElements(input, stepName)];

      return acc;
    }, formbag);
};
