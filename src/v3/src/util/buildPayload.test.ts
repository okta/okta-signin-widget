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

import { FormBag } from 'src/types';

import { buildPayload } from './buildPayload';

describe('buildPayload Tests', () => {
  let formBag: FormBag;

  beforeEach(() => {
    formBag = {
      schema: {
        properties: {
          identifier: {
            type: 'string',
          },
        },
      },
      uischema: {
        type: 'VerticalLayout',
        elements: [],
      },
    };
  });

  it('should return undefined when formbag is undefined', () => {
    expect(buildPayload()).toBeUndefined();
  });

  it('should return empty object when formbag contains mutable properties', () => {
    expect(buildPayload(formBag)).toEqual({});
  });

  it('should return object containing provided params when formbag contains mutable properties', () => {
    const data = { foo: 'bar' };
    expect(buildPayload(formBag, data)).toEqual(data);
  });

  it('should return combined object containing provided params and immutable properties from formBag', () => {
    const data = { foo: 'bar' };
    formBag = {
      schema: {
        properties: {
          methodType: {
            type: 'string',
            readOnly: true,
            const: 'sms',
          },
        },
      },
      uischema: {
        type: 'VerticalLayout',
        elements: [],
      },
    };
    expect(buildPayload(formBag, data)).toEqual({ ...data, methodType: 'sms' });
  });

  it('should return combined object containing provided params and nested immutable'
    + ' properties from formBag', () => {
    const data = { foo: 'bar' };
    formBag = {
      schema: {
        properties: {
          authenticator: {
            properties: {
              id: {
                type: 'string',
                const: '123abc',
                readOnly: true,
              },
              methodType: {
                type: 'string',
              },
              enrollmentId: {
                type: 'string',
                const: 'abc555',
                readOnly: true,
              },
            },
          },
        },
      },
      uischema: {
        type: 'VerticalLayout',
        elements: [],
      },
    };
    expect(buildPayload(formBag, data))
      .toEqual({ ...data, authenticator: { id: '123abc', enrollmentId: 'abc555' } });
  });
});
