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

import { Input, NextStep } from '@okta/okta-auth-js';

import {
  FormBag, TransformStepFnWithOptions, UISchemaElement,
} from '../../types';
import { flattenInputs } from '../../util';
import { transformer as attributesTransformer } from './attributes';
import { transformer as typeTransformer } from './type';

const mapUiElement = (input: Input): UISchemaElement => {
  const { name, label } = input;
  const fieldType = typeTransformer(input);
  const attributes = attributesTransformer(input);

  return {
    type: 'Field',
    label,
    name,
    options: {
      inputMeta: { ...input },
      ...fieldType?.[input.name],
      ...attributes,
    },
  } as UISchemaElement;
};

export const transformStepInputs = (
  formbag: FormBag,
  step?: NextStep,
): FormBag => {
  if (!step) {
    return formbag;
  }

  const { inputs = [] } = step;

  return inputs
    .reduce((acc: Input[], input: Input) => {
      const flattenedInputs = flattenInputs(input);
      return [...acc, ...flattenedInputs];
    }, [])
    .filter((input) => input.visible !== false && input.mutable !== false)
    .reduce((acc: FormBag, input: Input) => {
      const { name, required, mutable, type } = input;

      // add uischema
      const uischema = mapUiElement(input);
      acc.uischema.elements = [...acc.uischema.elements, uischema];

      // add client validation for "required" field
      // do not validate immutable fields, they will always be added to payload programatically
      if (required && mutable !== false && type !== 'object') {
        acc.dataSchema[name] = {
          validate(data) {
            const isValid = !!data[name];
            return isValid ? undefined : {
              i18n: {
                key: 'model.validation.field.blank',
              },
            };
          },
        };
        acc.fieldsToValidate.push(name);
      }

      return acc;
    }, formbag);
};

export const transformFields: TransformStepFnWithOptions = ({
  transaction, step: stepName,
}) => (formbag) => {
  const { availableSteps = [], nextStep = {} as NextStep } = transaction;
  const step = nextStep.name === stepName
    ? nextStep
    : availableSteps.find((s) => s.name === stepName);
  return transformStepInputs(formbag, step);
};
