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

import { ControlElement } from '@jsonforms/core';
import { IdxOption } from '@okta/okta-auth-js/lib/idx/types/idx-js';
import { getStubTransactionWithNextStep } from 'src/mocks/utils/utils';
import { FormBag } from 'src/types';

import { transformSelectAuthenticatorUnlockVerify } from '.';

describe('Unlock Verification Authenticator Selector Tests', () => {
  const transaction = getStubTransactionWithNextStep();
  let formBag: FormBag;
  beforeEach(() => {
    formBag = {
      envelope: {},
      data: {},
      schema: {
        properties: {
          authenticator: {},
        },
      },
      uischema: {
        type: 'VerticalLayout',
        elements: [],
      },
    };
    transaction.nextStep = {
      name: '',
      inputs: [{ name: 'authenticator' }],
      options: [
        {
          label: 'Email',
          value: 'okta_email',
        } as IdxOption,
      ],
    };
  });

  it('should add UI elements for unlock verification authenticator selector', () => {
    const updatedFormBag = transformSelectAuthenticatorUnlockVerify(transaction, formBag);

    expect(updatedFormBag.uischema.elements.length).toBe(2);
    expect(updatedFormBag.uischema.elements[0].options?.content)
      .toBe('unlockaccount');
    expect((updatedFormBag.uischema.elements[1] as ControlElement).scope)
      .toBe('#/properties/authenticator');
    expect((updatedFormBag.uischema.elements[1] as ControlElement).label)
      .toBe('');
    expect(updatedFormBag.schema.properties?.authenticator).toEqual({
      type: 'object',
      enum: [{
        label: 'Email',
        value: {
          key: 'okta_email',
          label: 'oie.verify.authenticator.button.text',
        },
      }],
    });
  });

  it('should add UI elements for unlock verification auth selector'
    + ' when additional inputs exists in the Idx response', () => {
    (formBag.schema.properties ?? {}).username = {
      type: 'string',
      required: ['username'],
      minLength: 1,
    };
    formBag.uischema.elements.push(
      { type: 'Control', scope: '#/properties/username', label: 'Username' } as ControlElement,
    );
    const updatedFormBag = transformSelectAuthenticatorUnlockVerify(transaction, formBag);

    expect(updatedFormBag.uischema.elements.length).toBe(3);
    expect(updatedFormBag.uischema.elements[0].options?.content)
      .toBe('unlockaccount');
    expect((updatedFormBag.uischema.elements[1] as ControlElement).scope)
      .toBe('#/properties/username');
    expect((updatedFormBag.uischema.elements[1] as ControlElement).label)
      .toBe('Username');
    expect((updatedFormBag.uischema.elements[2] as ControlElement).scope)
      .toBe('#/properties/authenticator');
    expect((updatedFormBag.uischema.elements[2] as ControlElement).label)
      .toBe('');
    expect(updatedFormBag.schema.properties?.authenticator).toEqual({
      type: 'object',
      enum: [{
        label: 'Email',
        value: {
          key: 'okta_email',
          label: 'oie.verify.authenticator.button.text',
        },
      }],
    });
  });
});
