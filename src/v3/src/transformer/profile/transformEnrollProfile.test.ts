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
import { IDX_STEP, PASSWORD_REQUIREMENT_VALIDATION_DELAY_MS } from 'src/constants';
import { getStubFormBag, getStubTransactionWithNextStep } from 'src/mocks/utils/utils';
import {
  ButtonElement,
  ButtonType,
  DescriptionElement,
  FieldElement,
  LinkElement,
  PasswordRequirementsElement,
  TitleElement,
  UISchemaLayout,
  WidgetProps,
} from 'src/types';

import { transformEnrollProfile } from './transformEnrollProfile';

describe('Enroll Profile Transformer Tests', () => {
  const transaction = getStubTransactionWithNextStep();
  const formBag = getStubFormBag();
  let widgetProps: WidgetProps;
  beforeEach(() => {
    formBag.uischema.elements = [
      { type: 'Field', options: { inputMeta: { name: 'userProfile.firstName' } } } as FieldElement,
      { type: 'Field', options: { inputMeta: { name: 'userProfile.lastName' } } } as FieldElement,
      { type: 'Field', options: { inputMeta: { name: 'userProfile.email' } } } as FieldElement,
    ];
    transaction.nextStep = {
      name: '',
    };
    widgetProps = {} as unknown as WidgetProps;
  });

  it('should only add title and submit button when select-identify doesnt exist in available steps '
    + 'and passcode element doesnt exist in schema', () => {
    const updatedFormBag = transformEnrollProfile({ transaction, formBag, widgetProps });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(6);
    expect(updatedFormBag.uischema.elements[0].type).toBe('Title');
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
      .toBe('oie.registration.form.title');
    expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options?.content)
      .toBe('oie.form.field.optional.description');
    expect((updatedFormBag.uischema.elements[2] as FieldElement).options?.inputMeta.name)
      .toBe('userProfile.firstName');
    expect((updatedFormBag.uischema.elements[3] as FieldElement).options?.inputMeta.name)
      .toBe('userProfile.lastName');
    expect((updatedFormBag.uischema.elements[4] as FieldElement).options?.inputMeta.name)
      .toBe('userProfile.email');
    expect((updatedFormBag.uischema.elements[5] as ButtonElement).label)
      .toBe('oie.registration.form.submit');
    expect((updatedFormBag.uischema.elements[5] as ButtonElement).type).toBe('Button');
    expect((updatedFormBag.uischema.elements[5] as ButtonElement).options?.type)
      .toBe(ButtonType.SUBMIT);
  });

  it('should not add password requirements but should add title, password, and button elements when passcode exists but password settings are empty', () => {
    formBag.uischema.elements.push({
      type: 'Field',
      label: 'Password',
      options: {
        inputMeta: { name: 'credentials.passcode', secret: true },
      },
    } as FieldElement);

    const updatedFormBag = transformEnrollProfile({ transaction, formBag, widgetProps });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(7);
    expect(updatedFormBag.uischema.elements[0].type).toBe('Title');
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
      .toBe('oie.registration.form.title');
    expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options?.content)
      .toBe('oie.form.field.optional.description');
    expect((updatedFormBag.uischema.elements[2] as FieldElement).options?.inputMeta.name)
      .toBe('userProfile.firstName');
    expect((updatedFormBag.uischema.elements[3] as FieldElement).options?.inputMeta.name)
      .toBe('userProfile.lastName');
    expect((updatedFormBag.uischema.elements[4] as FieldElement).options?.inputMeta.name)
      .toBe('userProfile.email');
    expect((updatedFormBag.uischema.elements[5] as FieldElement).options?.inputMeta.name)
      .toBe('credentials.passcode');
    expect((updatedFormBag.uischema.elements[5] as FieldElement).options?.attributes?.autocomplete)
      .toBe('new-password');
    expect((updatedFormBag.uischema.elements[6] as ButtonElement).label)
      .toBe('oie.registration.form.submit');
    expect((updatedFormBag.uischema.elements[6] as ButtonElement).type).toBe('Button');
    expect((updatedFormBag.uischema.elements[6] as ButtonElement).options?.type)
      .toBe(ButtonType.SUBMIT);
  });

  it('should add password requirements along with title, and submit button when passcode and password settings exists', () => {
    formBag.uischema.elements.push({
      type: 'Field',
      label: 'Password',
      options: {
        inputMeta: { name: 'credentials.passcode', secret: true },
      },
    } as FieldElement);
    transaction.nextStep = {
      name: '',
      inputs: [
        { name: 'userProfile', value: [] },
        {
          name: 'credentials',
          value: [],
          // @ts-ignore OKTA-545082 relatesTo prop missing from Input interface
          relatesTo: {
            value: {
              settings: { complexity: { minNumber: 1, minSymbol: 1 } },
            } as unknown as IdxAuthenticator,
          },
        },
      ],
    };

    const updatedFormBag = transformEnrollProfile({ transaction, formBag, widgetProps });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(8);
    expect(updatedFormBag.uischema.elements[0].type).toBe('Title');
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
      .toBe('oie.registration.form.title');
    expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options?.content)
      .toBe('oie.form.field.optional.description');
    expect((updatedFormBag.uischema.elements[2] as FieldElement).options?.inputMeta.name)
      .toBe('userProfile.firstName');
    expect((updatedFormBag.uischema.elements[3] as FieldElement).options?.inputMeta.name)
      .toBe('userProfile.lastName');
    expect((updatedFormBag.uischema.elements[4] as FieldElement).options?.inputMeta.name)
      .toBe('userProfile.email');
    expect(updatedFormBag.uischema.elements[5].type).toBe('PasswordRequirements');
    expect((updatedFormBag.uischema.elements[5] as PasswordRequirementsElement).options?.id)
      .toBe('password-authenticator--list');
    expect((updatedFormBag.uischema.elements[5] as PasswordRequirementsElement).options?.header)
      .toBe('password.complexity.requirements.header');
    expect((updatedFormBag.uischema.elements[5] as PasswordRequirementsElement).options?.userInfo)
      .toEqual({});
    expect((updatedFormBag.uischema.elements[5] as PasswordRequirementsElement).options?.settings)
      .toEqual({ complexity: { minNumber: 1, minSymbol: 1 } });
    expect((updatedFormBag.uischema.elements[5] as PasswordRequirementsElement)
      .options?.validationDelayMs).toBe(PASSWORD_REQUIREMENT_VALIDATION_DELAY_MS);
    expect((updatedFormBag.uischema.elements[6] as FieldElement).options?.inputMeta.name)
      .toBe('credentials.passcode');
    expect((updatedFormBag.uischema.elements[6] as FieldElement).options?.attributes?.autocomplete)
      .toBe('new-password');
    expect((updatedFormBag.uischema.elements[7] as ButtonElement).label)
      .toBe('oie.registration.form.submit');
    expect((updatedFormBag.uischema.elements[7] as ButtonElement).type).toBe('Button');
    expect((updatedFormBag.uischema.elements[7] as ButtonElement).options?.type)
      .toBe(ButtonType.SUBMIT);
  });

  it('should add link to log in when select-identify step exists in remediation', () => {
    transaction.availableSteps = [{
      name: IDX_STEP.SELECT_IDENTIFY,
      action: jest.fn(),
    }];

    const updatedFormBag = transformEnrollProfile({ transaction, formBag, widgetProps });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(8);
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
      .toBe('oie.registration.form.title');
    expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options?.content)
      .toBe('oie.form.field.optional.description');
    expect((updatedFormBag.uischema.elements[2] as FieldElement).options?.inputMeta.name)
      .toBe('userProfile.firstName');
    expect((updatedFormBag.uischema.elements[3] as FieldElement).options?.inputMeta.name)
      .toBe('userProfile.lastName');
    expect((updatedFormBag.uischema.elements[4] as FieldElement).options?.inputMeta.name)
      .toBe('userProfile.email');
    expect((updatedFormBag.uischema.elements[5] as ButtonElement).label)
      .toBe('oie.registration.form.submit');
    expect((updatedFormBag.uischema.elements[5] as ButtonElement).type).toBe('Button');
    expect((updatedFormBag.uischema.elements[5] as ButtonElement).options?.type)
      .toBe(ButtonType.SUBMIT);
    expect(updatedFormBag.uischema.elements[6].type).toBe('Divider');
    expect(updatedFormBag.uischema.elements[7].type).toBe('HorizontalLayout');
    expect(((updatedFormBag.uischema.elements[7] as UISchemaLayout)
      .elements[0] as DescriptionElement).options.content).toBe('haveaccount');
    expect(((updatedFormBag.uischema.elements[7] as UISchemaLayout)
      .elements[1] as LinkElement).options.label).toBe('signin');
  });
});
