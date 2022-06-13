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

import { JsonSchema7 } from '@jsonforms/core';
import { IdxActionParams } from '@okta/okta-auth-js';
import merge from 'lodash/merge';
import set from 'lodash/set';

import { FormBag, JsonObject, Undefinable } from '../types';

const parseProperties = (properties: JsonSchema7['properties'], path?: string[]): JsonObject => {
  const immutableData = Object.entries(properties || {})
    .reduce((acc, [key, val]) => {
      const objectPathArr: string[] = [...(path ?? []).filter(Boolean), key];
      if (val.properties) {
        return parseProperties(val.properties, objectPathArr);
      }

      if (val.readOnly) {
        set(acc, objectPathArr, val.const);
      }
      return acc;
    }, {});
  return immutableData;
};

export const buildPayload = (
  formBag?: FormBag,
  params?: IdxActionParams,
): Undefinable<IdxActionParams> => {
  if (!formBag) {
    return params;
  }

  const immutableData = parseProperties(formBag.schema.properties || {});

  return merge(immutableData, params);
};
