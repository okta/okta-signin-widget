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

import { IdxActionParams } from '@okta/okta-auth-js';
import { merge } from 'lodash';

import { FormBag } from '../../types';
import { toNestedObject } from './toNestedObject';

export const buildPayload = (
  formbag: FormBag,
  params?: IdxActionParams,
): IdxActionParams => {
  const unmutableData = Object.entries(formbag.schema.properties || {})
    // TODO: figure out best way to pass idx meta to json form schema
    // @ts-ignore
    .filter(([_key, value]) => value.mutable === false)
    .reduce((acc, [key, value]) => {
      const obj = toNestedObject(key, value.const);
      return merge(acc, obj);
    }, {});
  return merge(unmutableData, params);
};
