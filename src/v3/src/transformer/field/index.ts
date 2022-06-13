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

import { ControlElement, JsonSchema, Layout } from '@jsonforms/core';
import { Input } from '@okta/okta-auth-js';
import { IdxOption } from '@okta/okta-auth-js/lib/idx/types/idx-js';
import get from 'lodash/get';
import pickBy from 'lodash/pickBy';
import set from 'lodash/set';
import { JsonObject } from 'src/types/json';
import { FieldTransformer, FormBag, Undefinable } from 'src/types/jsonforms';

import { createForm } from '../utils';
import { Result, transformer as typeTransformer } from './schema/type';
import { transformer as labelTransformer } from './uischema/label';
import { transformer as mutableTransformer } from './uischema/options/mutable';
import { transformer as radioTransformer } from './uischema/options/radio';
import { transformer as secretTransformer } from './uischema/options/secret';
import { transformer as visibleTransformer } from './uischema/options/visible';

const optionsTransformers: FieldTransformer[] = [
  mutableTransformer,
  radioTransformer,
  secretTransformer,
  visibleTransformer,
];

type InputTransformer = {
  (field: Input, args: {
    path: string[],
    schema: JsonSchema,
    uischema: Layout,
    options?: IdxOption[]
  }): void;
};

/*
This is a great idea, can be implemented later
const getOptions = (input: Input): Record<string, unknown> => {
  const options: Record<string, unknown> = {};

  if (input.required) {
    options.required = true;
  }

  if (input.secret) {
    options.secret = true;
    options.type = 'password';
  }

  const map = new Map<string, Record<string, unknown>>([
    ['identifier', { type: 'text', autocomplete: 'username' }],
    ['username', { type: 'text', autocomplete: 'username' }],
    ['passcode', { type: 'password', autocomplete: 'current-password' }],
    ['password', { type: 'password', autocomplete: 'current-password' }],
  ]);

  const attrs = map.get(input.name) ?? {};
  return { ...options, attrs };
};
*/

const getOptions = (input: Input): Undefinable<JsonObject> => {
  const options = optionsTransformers
    .map((optionTransform) => optionTransform(input) as JsonObject | null)
    .reduce((acc, opt) => ( opt ? { ...acc, ...opt } : acc ), {} as JsonObject);

  if (options === null) {
    return undefined;
  }

  return {
    ...options,
    inputMeta: { ...input } as unknown as JsonObject,
  };
};

const addMinlengthToSchemaIfNecessary = (
  input: Input,
  schema: JsonSchema,
  path: string[],
  fieldType: Result | null,
): void => {
  // conditionally adds minLength prop to input's schema
  // This ensure required strings have at least 1 character
  if (fieldType?.[input.name].type === 'string') {
    set(schema, [...path, input.name, 'minLength'], 1);
  }
};

export const transformInput: InputTransformer = (input: Input, {
  path,
  schema,
  uischema,
  options,
}) => {
  // field type
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
  if (input.required) {
    if (path.length > 1) {
      set(
        schema,
        [...(path.slice(0, -1)), 'required'],
        [...get(schema, [...(path.slice(0, -1)), 'required'], []), input.name],
      );
      addMinlengthToSchemaIfNecessary(input, schema, path, fieldType);
    } else {
      if (typeof schema.required === 'undefined') {
        set(schema, ['required'], [input.name]);
      } else {
        schema.required.push(input.name);
      }
      addMinlengthToSchemaIfNecessary(input, schema, path, fieldType);
    }
  }

  if (input.mutable === false) {
    set(schema, [...path, input.name, 'readOnly'], !input.mutable);
  }

  // add it to data[fieldname]
  // if ('value' in input) {
  //   if (input.type === 'object') {
  //     set(data, [...path, input.name].filter((val) => val !== 'properties'), {});
  //   } else {
  //     set(data, [...path, input.name].filter((val) => val !== 'properties'), input.value);
  //   }
  // }

  if ('value' in input && typeof input.value !== 'object') {
    set(schema, [...path, input.name, 'const'], input.value);
  }

  if (typeof input.value === 'object') {
    (input.value as Input[]).forEach((subField: Input) => {
      // RECURSIVE call for nested input form fields
      transformInput(subField, {
        schema: set(schema, [...path, input.name, 'properties'], {
          ...get(schema, [...path, input.name, 'properties'], {}),
        }),
        uischema,
        path: [...path, input.name, 'properties'],
        // @ts-ignore options is missing from type
        options: subField.options,
      });
    });
  } else {
    const ctrl: ControlElement = {
      type: 'Control',
      label: labelTransformer(input),
      scope: ['#', ...path, input.name].join('/'),
      options: getOptions(input),
    };
    uischema.elements.push(pickBy(ctrl, (c) => c !== undefined) as ControlElement);
  }
};

export const transformInputs = (inputs?: Input[]): FormBag => {
  const { schema, uischema } = createForm();
  inputs?.forEach((field) => transformInput(field, {
    path: ['properties'],
    schema,
    uischema,
  }));
  return { schema, uischema };
};
