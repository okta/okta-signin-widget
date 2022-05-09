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

import { transformSelectAuthenticatorEnroll } from '.';

describe('Enroll Authenticator Selector Transformer Tests', () => {
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

  it('should add UI elements for required authenticator selection'
    + ' when email authenticator exists', () => {
    const updatedFormBag = transformSelectAuthenticatorEnroll(transaction, formBag);

    expect(updatedFormBag.uischema.elements.length).toBe(3);
    expect(updatedFormBag.uischema.elements[0].options?.content)
      .toBe('oie.select.authenticators.enroll.title');
    expect(updatedFormBag.uischema.elements[1].options?.content)
      .toBe('oie.select.authenticators.enroll.subtitle');
    expect((updatedFormBag.uischema.elements[2] as ControlElement).scope)
      .toBe('#/properties/authenticator');
    expect((updatedFormBag.uischema.elements[2] as ControlElement).label)
      .toBe('oie.setup.required');
    expect(updatedFormBag.schema.properties?.authenticator).toEqual({
      type: 'object',
      enum: [{
        label: 'Email',
        value: {
          key: 'okta_email',
          label: 'oie.enroll.authenticator.button.text',
        },
      }],
    });
  });

  it('should add UI elements for optional authenticator selection'
    + ' when email & phone authenticators exists', () => {
    transaction.nextStep = {
      name: '',
      canSkip: true,
      inputs: [{ name: 'authenticator' }],
      options: [
        {
          label: 'Email',
          value: 'okta_email',
        } as IdxOption,
        {
          label: 'Phone',
          value: 'phone',
        } as IdxOption,
      ],
    };
    const updatedFormBag = transformSelectAuthenticatorEnroll(transaction, formBag);

    expect(updatedFormBag.uischema.elements.length).toBe(4);
    expect(updatedFormBag.uischema.elements[0].options?.content)
      .toBe('oie.select.authenticators.enroll.title');
    expect(updatedFormBag.uischema.elements[1].options?.content)
      .toBe('oie.select.authenticators.enroll.subtitle');
    expect((updatedFormBag.uischema.elements[2] as ControlElement).scope)
      .toBe('#/properties/authenticator');
    expect((updatedFormBag.uischema.elements[2] as ControlElement).label)
      .toBe('oie.setup.optional');
    expect((updatedFormBag.uischema.elements[3] as ControlElement).label)
      .toBe('enroll.choices.submit.finish');
    expect((updatedFormBag.uischema.elements[3] as ControlElement).options?.idxMethodParams?.skip)
      .toBe(true);
    expect(updatedFormBag.schema.properties?.authenticator).toEqual({
      type: 'object',
      enum: [{
        label: 'Email',
        value: {
          key: 'okta_email',
          label: 'oie.enroll.authenticator.button.text',
        },
      },
      {
        label: 'Phone',
        value: {
          key: 'phone',
          label: 'oie.enroll.authenticator.button.text',
        },
      }],
    });
  });
});
