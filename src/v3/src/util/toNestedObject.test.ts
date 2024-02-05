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

import { toNestedObject } from './toNestedObject';

describe('toNestedObject', () => {
  it('produces nested object', () => {
    expect(toNestedObject({ 'a.b.c': 'foo' })).toEqual({
      a: {
        b: {
          c: 'foo',
        },
      },
    });
  });

  it('should produce a nested object when param contains multiple fields', () => {
    const nestedObject = toNestedObject({ 'a.b.c': 'foo', 'a.b.d': 'bar', b: 'foobar' });

    expect(nestedObject).toEqual({
      a: {
        b: {
          c: 'foo',
          d: 'bar',
        },
      },
      b: 'foobar',
    });
  });

  it('should not produce nested object for keysWithoutNesting', () => {
    expect(toNestedObject({
      consent: true,
      'optedScopes.email': true,
      'optedScopes.some.scope': true,
    }, ['optedScopes'])).toEqual({
      consent: true,
      optedScopes: {
        email: true,
        'some.scope': true,
      },
    });
  });
});
