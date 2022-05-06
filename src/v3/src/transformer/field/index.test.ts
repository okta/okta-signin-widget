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

import { transformField } from 'src/transformer/field';
import { IonFormField } from 'src/types/ion';

describe('merge field transformations', () => {
  it('should transform ion data to JSONForm data', () => {
    const input: IonFormField[] = [
      {
        name: 'identifier',
        label: 'Username',
      },
      {
        name: 'rememberMe',
        label: 'Remember Me',
        type: 'boolean',
      },
      {
        name: 'stateHandle',
        required: true,
        value: 'DUMMY_STATE_HANDLE',
        visible: false,
        mutable: false,
      },
    ];

    const result = {
      schema: {
        type: 'object',
        properties: {
          identifier: {
            type: 'string',
          },
          rememberMe: {
            type: 'boolean',
          },
          stateHandle: {
            type: 'string',
            minLength: 1,
          },
        },
        required: [
          'stateHandle',
        ],
      },
      uischema: {
        type: 'VerticalLayout',
        elements: [{
          type: 'Control',
          scope: '#/properties/identifier',
          label: 'Username',
        },
        {
          type: 'Control',
          scope: '#/properties/rememberMe',
          label: 'Remember Me',
        },
        {
          type: 'Control',
          scope: '#/properties/stateHandle',
          label: 'stateHandle',
          options: {
            readonly: true,
            type: 'hidden',
          },
        },
        ],
      },
      data: {
        stateHandle: 'DUMMY_STATE_HANDLE',
      },
    };
    expect(transformField(input)).toEqual(expect.objectContaining(result));
  });
});
