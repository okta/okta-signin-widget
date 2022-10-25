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

import { IdxAuthenticator } from '@okta/okta-auth-js';
import { getStubFormBag, getStubTransactionWithNextStep } from 'src/mocks/utils/utils';
import {
  ButtonElement,
  ButtonType,
  FieldElement,
  TitleElement,
  WidgetProps,
} from 'src/types';

import { transformEnrollProfile } from './transformEnrollProfile';

describe('Enroll Profile Update Transformer Tests', () => {
  const transaction = getStubTransactionWithNextStep();
  const formBag = getStubFormBag();
  let widgetProps: WidgetProps;
  beforeEach(() => {
    formBag.uischema.elements = [
      { type: 'Field', options: { inputMeta: { name: 'userProfile.firstName', required: false } } } as FieldElement,
      { type: 'Field', options: { inputMeta: { name: 'userProfile.lastName', required: false } } } as FieldElement,
      { type: 'Field', options: { inputMeta: { name: 'userProfile.email', required: false } } } as FieldElement,
    ];
    transaction.nextStep = {
      name: '',
    };
    transaction.availableSteps = [{ name: 'skip', action: jest.fn() }];
    widgetProps = {};
  });

  it('should add title, button, skip link and input elements from remediation with all optional fields', () => {
    const updatedFormBag = transformEnrollProfile({ transaction, formBag, widgetProps });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(5);
    expect(updatedFormBag.uischema.elements[0].type).toBe('Title');
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
      .toBe('oie.registration.form.title');
    expect((updatedFormBag.uischema.elements[1] as FieldElement).options?.inputMeta.name)
      .toBe('userProfile.firstName');
    expect((updatedFormBag.uischema.elements[2] as FieldElement).options?.inputMeta.name)
      .toBe('userProfile.lastName');
    expect((updatedFormBag.uischema.elements[3] as FieldElement).options?.inputMeta.name)
      .toBe('userProfile.email');
    expect((updatedFormBag.uischema.elements[4] as ButtonElement).label)
      .toBe('oie.registration.form.submit');
    expect((updatedFormBag.uischema.elements[4] as ButtonElement).type).toBe('Button');
    expect((updatedFormBag.uischema.elements[4] as ButtonElement).options?.type)
      .toBe(ButtonType.SUBMIT);
  });

  it('should add title button and input elements from remediation with at least one required field', () => {
    formBag.uischema.elements.push({
      type: 'Field',
      label: 'Password',
      options: {
        inputMeta: { name: 'credentials.passcode', secret: true },
      },
    } as FieldElement);
    transaction.nextStep = {
      name: '',
      relatesTo: {
        value: {
          settings: {},
        } as unknown as IdxAuthenticator,
      },
    };
    const mockUserInfo = {
      identifier: 'testuser@okta.com',
      profile: { firstName: 'test', lastName: 'user' },
    };
    transaction.context.user = {
      type: 'object',
      value: mockUserInfo,
    };

    const updatedFormBag = transformEnrollProfile({ transaction, formBag, widgetProps });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(6);
    expect(updatedFormBag.uischema.elements[0].type).toBe('Title');
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
      .toBe('oie.registration.form.title');
    expect((updatedFormBag.uischema.elements[1] as FieldElement).options?.inputMeta.name)
      .toBe('userProfile.firstName');
    expect((updatedFormBag.uischema.elements[2] as FieldElement).options?.inputMeta.name)
      .toBe('userProfile.lastName');
    expect((updatedFormBag.uischema.elements[3] as FieldElement).options?.inputMeta.name)
      .toBe('userProfile.email');
    expect((updatedFormBag.uischema.elements[4] as FieldElement).options?.inputMeta.name)
      .toBe('credentials.passcode');
    expect((updatedFormBag.uischema.elements[4] as FieldElement).options?.attributes?.autocomplete)
      .toBe('new-password');
    expect((updatedFormBag.uischema.elements[5] as ButtonElement).label)
      .toBe('oie.registration.form.submit');
    expect((updatedFormBag.uischema.elements[5] as ButtonElement).type).toBe('Button');
    expect((updatedFormBag.uischema.elements[5] as ButtonElement).options?.type)
      .toBe(ButtonType.SUBMIT);
  });
});
