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
import merge from 'lodash/merge';

const nestEntry = (parts: string[], value: unknown): IdxActionParams => {
  const res: IdxActionParams = {};
  const key = parts.shift()!;
  if (!parts.length) {
    res[key] = value as IdxActionParams['value'];
  } else {
    res[key] = nestEntry(parts, value);
  }

  return res;
};

export const toNestedObject = (
  params: Record<string, unknown>,
  keysWithoutNesting?: string[],
): IdxActionParams => Object.entries(params || {})
  .reduce((acc, [key, value]) => {
    let parts = key.split('.');
    const [firstPart, ...otherParts] = parts;
    if (keysWithoutNesting?.includes(firstPart)) {
      parts = [firstPart, otherParts.join('.')];
    }
    const nestedField = nestEntry(parts, value);
    return merge(acc, nestedField);
  }, {});
