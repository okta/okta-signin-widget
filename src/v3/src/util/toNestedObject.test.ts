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

  // OKTA-1174752 / customer PR #4024 (Brex): gen2 Courage's `unflatten` mishandled
  // a plain scope sharing its prefix with a dotted scope. Gen3 doesn't go through
  // Courage at all (React form state -> useOnSubmit -> toNestedObject with
  // keysWithoutNesting=['optedScopes']), so there is no render-time analog of
  // the gen2 crash. The submit-time grouping below pins gen3's correct behavior
  // for both customer scenarios.

  // Customer scenario 1: plain scope is `true`. Gen2's unflatten threw
  // "Cannot create property 'custom2' on boolean 'true'".
  it('keeps a true plain key and a dotted key sharing its prefix as distinct siblings', () => {
    expect(toNestedObject({
      consent: true,
      'optedScopes.custom1': true,
      'optedScopes.custom1.custom2': false,
    }, ['optedScopes'])).toEqual({
      consent: true,
      optedScopes: {
        custom1: true,
        'custom1.custom2': false,
      },
    });
  });

  // Customer scenario 2: plain scope is `false`. Gen2's unflatten check
  // `if (!ref[part])` treated `false` as unset and silently overwrote it
  // with an empty object, dropping the user's choice from the payload.
  it('preserves a false plain key when a dotted key shares its prefix', () => {
    expect(toNestedObject({
      consent: true,
      'optedScopes.custom1': false,
      'optedScopes.custom1.custom2': true,
    }, ['optedScopes'])).toEqual({
      consent: true,
      optedScopes: {
        custom1: false,
        'custom1.custom2': true,
      },
    });
  });
});
