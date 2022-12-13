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

import { Result, transformer } from './type';

describe('"type" field transformer', () => {
  it('should add type to schema.properties.{fieldname} if type is present in ION formfield', () => {
    const formfield: Input = { name: 'foo', type: 'boolean' };
    const result: Result = {
      foo: {
        type: 'boolean',
        pattern: undefined,
      },
    };
    expect(transformer(formfield)).toEqual(result);
  });

  it('should add set type to string as default if "type" field is not present in ION formfield', () => {
    const formfield: Input = { name: 'foo' };
    const result = {
      foo: {
        type: 'string',
        pattern: undefined,
      },
    };
    expect(transformer(formfield)).toEqual(result);
  });
});
