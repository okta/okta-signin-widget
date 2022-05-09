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
import { transformInputs } from 'src/transformer/field';
import { IonFormField } from 'src/types';

describe('merge field transformations', () => {
  it('should transform ion data to JSONForm data', () => {
    const inputs: IonFormField[] = [
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
            pattern: undefined,
          },
          rememberMe: {
            type: 'boolean',
            pattern: undefined,
          },
          stateHandle: {
            type: 'string',
            pattern: undefined,
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
    expect(transformInputs(inputs as Input[])).toEqual(expect.objectContaining(result));
  });

  it('should transform ion data that has nested form fields to JSONForm data', () => {
    const inputs: Input[] = [
      {
        label: 'Okta Verify',
        name: 'authenticator',
        type: 'object',
        value: {
          form: {
            value: [
              {
                mutable: false,
                name: 'id',
                required: true,
                value: 'aut2h3fft4y9pDPCS1d7',
              },
              {
                name: 'channel',
                options: [
                  { label: 'QRCODE', value: 'qrcode' },
                  { label: 'EMAIL', value: 'email' },
                  { label: 'SMS', value: 'sms' },
                ],
                required: false,
                type: 'string',
              },
            ],
          },
        },
      },
    ];

    const result = {
      schema: {
        type: 'object',
        properties: {
          authenticator: {
            type: 'object',
            pattern: undefined,
            required: ['id'],
            properties: {
              channel: {
                type: 'string',
                pattern: undefined,
                enum: ['qrcode', 'email', 'sms'],
              },
              id: {
                type: 'string',
                pattern: undefined,
                minLength: 1,
              },
            },
          },
        },
        required: [],
      },
      uischema: {
        type: 'VerticalLayout',
        elements: [{
          type: 'Control',
          scope: '#/properties/authenticator/properties/id',
          label: 'id',
          options: { readonly: true },
        },
        {
          type: 'Control',
          scope: '#/properties/authenticator/properties/channel',
          label: 'channel',
        }],
      },
      data: {
        authenticator: {
          id: 'aut2h3fft4y9pDPCS1d7',
        },
      },
    };
    expect(transformInputs(inputs)).toEqual(result);
  });
});
