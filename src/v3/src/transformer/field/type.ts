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

import { Input } from '@okta/okta-auth-js';
import { FieldTransformer } from 'src/types';

type JsonSchemaType =
 | 'string'
 | 'number'
 | 'object'
 | 'array'
 | 'boolean'
 | 'null';

const map = new Map<string, JsonSchemaType>([
  ['array', 'array'],
  ['binary', 'string'],
  ['boolean', 'boolean'],
  ['date', 'string'],
  ['datetime', 'string'],
  ['decimal', 'number'],
  ['duration', 'string'],
  ['email', 'string'],
  ['file', 'null'],
  ['integer', 'number'],
  ['iri', 'string'],
  ['link', 'object'],
  ['number', 'number'],
  ['object', 'object'],
  ['pdatetime', 'string'],
  ['ptime', 'string'],
  ['string', 'string'],
  ['text', 'string'],
  ['time', 'string'],
  ['url', 'string'],
]);

export type Result = {
  [name: string]: Record<string, unknown>;
};

export const transformer: FieldTransformer<Result> = (input: Input) => ({
  [input.name]: {
    type: map.get(
      // TODO: authenticator object in authenticator-verification-data is string instead of object
      typeof input.value === 'object'
        ? 'object'
        : (input.type ?? 'string'),
    ),
  },
});
