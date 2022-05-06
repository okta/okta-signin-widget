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

import * as _ from 'lodash';
import { IonFormField } from 'src/types/ion';
import { JsonObject } from 'src/types/json';
import { FieldTransformer, FormBag } from 'src/types/jsonforms';

import { transformer as requiredTransformer } from './schema/required';
import { transformer as typeTransformer } from './schema/type';
import { transformer as labelTransformer } from './uischema/label';
import { transformer as mutableTransformer } from './uischema/options/mutable';
import { transformer as secretTransformer } from './uischema/options/secret';
import { transformer as visibleTransformer } from './uischema/options/visible';
import { transformer as valueTransformer } from './value';

const optionsTransformers: FieldTransformer[] = [
  mutableTransformer,
  secretTransformer,
  visibleTransformer,
];

export function transformField(ionFormFields: IonFormField[]): FormBag {
  const formbag: FormBag = {
    envelope: {},
    schema: {
      type: 'object',
      properties: {},
      required: [],
    },
    uischema: {
      type: 'VerticalLayout',
      elements: [],
    },
    data: {},
  };

  function transformCombined(ionFormField: IonFormField) {
    // controlled creation of ui element, add scope to avoid recursive calls
    const uiElement = {
      type: 'Control',
      scope: `#/properties/${ionFormField.name}`,
      label: labelTransformer(ionFormField),
    };

    // construct options
    const uiElementOptions = {
      options: optionsTransformers
        .map((optionTransform) => optionTransform(ionFormField) as JsonObject | null)
        .reduce((acc, opt) => ( opt ? { ...acc, ...opt } : acc ), {} as JsonObject),
    };

    if (!_.isEmpty(uiElementOptions.options)) {
      _.assign(uiElement, uiElementOptions);
    }

    // construct schema data property and additionals to required array
    const newDataProp = typeTransformer(ionFormField);
    const required = requiredTransformer(ionFormField);
    const data = valueTransformer(ionFormField);

    // append results to accumulator
    formbag.schema.properties = {
      ...formbag.schema.properties,
      ...newDataProp,
    };
    if ( required !== null) {
      formbag.schema.required?.push(required);
      if (formbag.schema.properties[required]?.type === 'string') {
        formbag.schema.properties[required] = {
          ...formbag.schema.properties[required],
          minLength: 1,
        };
      }
    }
    formbag.uischema.elements.push(uiElement);
    formbag.data = { ...formbag.data, ...data };
  }

  ionFormFields.forEach((field) => transformCombined(field));

  return formbag;
}
