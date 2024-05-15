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
import { IdxOption } from '@okta/okta-auth-js/types/lib/idx/types/idx-js';
import { get, set } from 'lodash';

import { FormBag, TransformStepFnWithOptions } from '../../types';
import { Result, transformer as typeTransformer } from '../field/type';
import { loc } from '../../util';

type InputTransformer = {
  (field: Input, args: {
    path: string[],
    schema: FormBag['schema'],
    data: FormBag['data'],
    options?: IdxOption[],
    subFieldRequired?: boolean,
  }): void;
};

// const setFieldErrorMessage = (
//   input: Input,
//   schema: FormBag['schema'],
//   path: string[],
//   fieldType: Result | null,
//   data: FormBag['data'],
// ): void => {
//   if (typeof schema.errorMessage === 'undefined') {
//     schema.errorMessage = { type: 'object' };
//   }
//   if (fieldType?.[input.name].type === 'string') {
//     set(schema, ['errorMessage', 'required', input.name], loc('model.validation.field.blank', 'login'));
//     // set(schema, ['errorMessage', ...(path.filter((item) => item !== 'properties')), input.name, 'minLength'], loc('model.validation.field.blank', 'login'));
//     // set(data, [...(path.filter((item) => item !== 'properties')), input.name], '');
//   }
// };

const addMinlengthToSchemaIfNecessary = (
  input: Input,
  schema: FormBag['schema'],
  path: string[],
  fieldType: Result | null,
): void => {
  // conditionally adds minLength prop to input's schema
  // This ensure required strings have at least 1 character
  if (fieldType?.[input.name].type === 'string') {
    set(schema, [...path, input.name, 'minLength'], 1);
  }
};

const mapInputSchema: InputTransformer = (
  input: Input,
  {
    path, schema, options, subFieldRequired, data,
  },
): void => {
  const fieldType = typeTransformer(input);
  set(schema, [...path, input.name], { ...fieldType?.[input.name] });
  // options as "enums"
  if (Array.isArray(options)) {
    // This would be good if we use jsonforms default enum renderer
    // https://jsonforms.io/docs/labels#oneof-enum-titles
    // set(schema, [...path, 'oneOf'], options.map((option) => ({
    //   const: option.value,
    //   title: option.label,
    // })));
    set(schema, [...path, input.name, 'enum'], options.map(({ value }) => value));
  }
  // add it to schema.required
  if (input.required || subFieldRequired) {
    if (path.length > 1) {
      set(
        schema,
        [...(path.slice(0, -1)), 'required'],
        [...get(schema, [...(path.slice(0, -1)), 'required'], []), input.name],
      );
    } else if (Array.isArray(schema.required)) {
      schema.required.push(input.name);
    } else {
      set(schema, ['required'], [input.name]);
    }
    // setFieldErrorMessage(input, schema, path, fieldType, data);
    // const fieldName = subFieldRequired ? [...path.filter((str) => str !== 'properties'), input.name].join('.') : input.name;
    // if (Array.isArray(schema.required)) {
    //   schema.required.push(fieldName);
    // } else {
    //   set(schema, ['required'], [fieldName]);
    // }
    addMinlengthToSchemaIfNecessary(input, schema, path, fieldType);
  }
  if (input.mutable === false) {
    set(schema, [...path, input.name, 'readOnly'], !input.mutable);
  }

  if ('value' in input && typeof input.value !== 'object') {
    set(schema, [...path, input.name, 'const'], input.value);
  }

  if (typeof input.value === 'object') {
    (input.value as Input[]).forEach((subField: Input) => {
      // RECURSIVE call for nested input form fields
      mapInputSchema(subField, {
        schema: set(schema, [...path, input.name, 'properties'], {
          ...get(schema, [...path, input.name, 'properties'], {}),
        }),
        path: [...path, input.name, 'properties'],
        options: subField.options,
        subFieldRequired: input.required,
        data,
      });
    });
  }
};

export const generateSchema: TransformStepFnWithOptions = ({
  transaction, step: stepName, // widgetProps,
}) => (formbag) => {
  const { availableSteps = [], nextStep = {} as NextStep } = transaction;
  const step = nextStep.name === stepName
    ? nextStep
    : availableSteps.find((s) => s.name === stepName);
  if (typeof step === 'undefined') {
    return formbag;
  }
  const { schema, data } = formbag;
  const { inputs = [] } = step;
  inputs.forEach((input) => mapInputSchema(input, { path: ['properties'], schema, data }));

  return formbag;
};
