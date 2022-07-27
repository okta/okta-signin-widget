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

import { IDX_STEP, PASSWORD_REQUIREMENT_VALIDATION_DELAY_MS } from 'src/constants';
import { getStubTransactionWithNextStep } from 'src/mocks/utils/utils';
import {
  ButtonElement,
  ButtonType,
  FieldElement,
  FormBag,
  PasswordRequirementsElement,
  TitleElement,
  UISchemaLayoutType,
  WidgetProps,
} from 'src/types';

import { transformEnrollProfile } from './transformEnrollProfile';

describe('Enroll Profile Transformer Tests', () => {
  const transaction = getStubTransactionWithNextStep();
  let formBag: FormBag;
  let mockProps: WidgetProps;
  beforeEach(() => {
    formBag = {
      dataSchema: {},
      schema: {},
      uischema: {
        type: UISchemaLayoutType.VERTICAL,
        elements: [],
      },
      data: {},
    };
    mockProps = {};
  });

  it('should only add title and submit button when select-identify doesnt exist in available steps '
    + 'and passcode element doesnt exist in schema', () => {
    const updatedFormBag = transformEnrollProfile(transaction, formBag, mockProps);

    expect(updatedFormBag.uischema.elements.length).toBe(2);
    expect(updatedFormBag.uischema.elements[0].type).toBe('Title');
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
      .toBe('oie.registration.form.title');
    expect((updatedFormBag.uischema.elements[1] as ButtonElement).label)
      .toBe('oie.registration.form.submit');
    expect((updatedFormBag.uischema.elements[1] as ButtonElement).type).toBe('Button');
    expect((updatedFormBag.uischema.elements[1] as ButtonElement).options?.type)
      .toBe(ButtonType.SUBMIT);
    expect((updatedFormBag.uischema.elements[1] as ButtonElement).options?.dataType)
      .toBe('save');
  });

  it('should add password requirements along with title, and submit button when passcode exists in schema', () => {
    formBag.uischema.elements = [
      {
        type: 'Control',
        label: 'Password',
        name: 'credentials.passcode',
      } as FieldElement,
    ];
    transaction.nextStep = {
      name: '',
      relatesTo: {
        value: {
          displayName: '',
          id: '',
          key: '',
          methods: [],
          type: '',
          settings: {},
        },
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

    const updatedFormBag = transformEnrollProfile(transaction, formBag, mockProps);

    expect(updatedFormBag.uischema.elements.length).toBe(4);
    expect(updatedFormBag.uischema.elements[0].type).toBe('Title');
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
      .toBe('oie.registration.form.title');
    expect(updatedFormBag.uischema.elements[1].type).toBe('PasswordRequirements');
    expect((updatedFormBag.uischema.elements[1] as PasswordRequirementsElement).options?.id)
      .toBe('password-authenticator--list');
    expect((updatedFormBag.uischema.elements[1] as PasswordRequirementsElement).options?.header)
      .toBe('password.complexity.requirements.header');
    expect((updatedFormBag.uischema.elements[1] as PasswordRequirementsElement).options?.userInfo)
      .toEqual(mockUserInfo);
    expect((updatedFormBag.uischema.elements[1] as PasswordRequirementsElement).options?.settings)
      .toEqual({});
    expect((updatedFormBag.uischema.elements[1] as PasswordRequirementsElement).options?.fieldKey)
      .toEqual('credentials.passcode');
    expect((updatedFormBag.uischema.elements[1] as PasswordRequirementsElement)
      .options?.validationDelayMs).toBe(PASSWORD_REQUIREMENT_VALIDATION_DELAY_MS);
    expect((updatedFormBag.uischema.elements[2] as FieldElement).label)
      .toBe('Password');
    expect((updatedFormBag.uischema.elements[2] as FieldElement).name)
      .toBe('credentials.passcode');
    expect((updatedFormBag.uischema.elements[2] as FieldElement).options?.attributes?.autocomplete)
      .toBe('new-password');
    expect((updatedFormBag.uischema.elements[3] as ButtonElement).label)
      .toBe('oie.registration.form.submit');
    expect((updatedFormBag.uischema.elements[3] as ButtonElement).type).toBe('Button');
    expect((updatedFormBag.uischema.elements[3] as ButtonElement).options?.type)
      .toBe(ButtonType.SUBMIT);
    expect((updatedFormBag.uischema.elements[3] as ButtonElement).options?.dataType)
      .toBe('save');
  });

  it('should add link to log in when select-identify step exists in remediation', () => {
    transaction.availableSteps = [{
      name: IDX_STEP.SELECT_IDENTIFY,
      action: jest.fn(),
    }];

    const updatedFormBag = transformEnrollProfile(transaction, formBag, mockProps);

    expect(updatedFormBag.uischema.elements.length).toBe(3);
    expect(updatedFormBag.uischema.elements[0].type).toBe('Title');
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
      .toBe('oie.registration.form.title');
    expect((updatedFormBag.uischema.elements[1] as ButtonElement).label)
      .toBe('oie.registration.form.submit');
    expect((updatedFormBag.uischema.elements[1] as ButtonElement).type).toBe('Button');
    expect((updatedFormBag.uischema.elements[1] as ButtonElement).options?.type)
      .toBe(ButtonType.SUBMIT);
    expect((updatedFormBag.uischema.elements[2] as ButtonElement).label).toBe('haveaccount');
    expect((updatedFormBag.uischema.elements[2] as ButtonElement).type).toBe('Button');
    expect((updatedFormBag.uischema.elements[2] as ButtonElement).options?.type)
      .toBe(ButtonType.BUTTON);
    expect((updatedFormBag.uischema.elements[2] as ButtonElement).options?.variant)
      .toBe('floating');
    expect((updatedFormBag.uischema.elements[2] as ButtonElement).options?.wide).toBe(false);
    expect((updatedFormBag.uischema.elements[2] as ButtonElement).options?.dataSe).toBe('back');
  });
});
