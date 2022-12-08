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

import { getStubFormBag } from 'src/mocks/utils/utils';
import {
  ButtonElement,
  ButtonType,
  FieldElement,
  FormBag,
  LinkElement,
  PasswordRequirementsElement,
  TitleElement,
  UISchemaElement,
} from 'src/types';

import { updatePasswordDescribedByValue } from './updatePasswordDescribedByValue';

describe('updatePasswordDescribedByValue Tests', () => {
  let formBag: FormBag;

  beforeEach(() => {
    formBag = getStubFormBag();
    formBag.uischema.elements = [
      { type: 'Title', id: 'title_1', options: { content: 'Password expired' } } as TitleElement,
      {
        type: 'PasswordRequirements',
        id: 'PasswordRequirements_abc123',
        options: {
          id: 'password-requirements-list',
          header: 'Password Requirements:',
          userInfo: {},
          settings: {},
          requirements: [],
          validationDelayMs: 50,
        },
      } as PasswordRequirementsElement,
      { type: 'Field', options: { inputMeta: { name: 'credentials.passcode', secret: true } } } as FieldElement,
      { type: 'Field', options: { inputMeta: { name: 'confirmPassword', secret: true } } } as FieldElement,
      { type: 'Button', id: 'button_1', options: { type: ButtonType.SUBMIT } } as ButtonElement,
      { type: 'Link', id: 'link_1', options: { label: 'Forgot Password' } } as LinkElement,
    ];
  });

  it('should not update password field aria-describedby value when PasswordRequirements element does not exist', () => {
    formBag.uischema.elements = formBag.uischema.elements.filter(
      (element) => element.type !== 'PasswordRequirements',
    );

    const updatedFormBag = updatePasswordDescribedByValue(formBag);

    expect(updatedFormBag).toMatchSnapshot();
    expect((updatedFormBag.uischema.elements[2] as UISchemaElement).ariaDescribedBy)
      .toBeUndefined();
    expect((updatedFormBag.uischema.elements[3] as UISchemaElement).ariaDescribedBy)
      .toBeUndefined();
  });

  it('should set password field aria-describedby value when PasswordRequirements element exists', () => {
    const updatedFormBag = updatePasswordDescribedByValue(formBag);

    expect(updatedFormBag).toMatchSnapshot();
    expect((updatedFormBag.uischema.elements[2] as UISchemaElement).ariaDescribedBy)
      .toBe('PasswordRequirements_abc123');
    expect((updatedFormBag.uischema.elements[3] as UISchemaElement).ariaDescribedBy)
      .toBe('PasswordRequirements_abc123');
  });

  it('should update password field aria-describedby value when PasswordRequirements element exists and password fields contain existing describedby value', () => {
    formBag.uischema.elements = formBag.uischema.elements.map(
      (element: UISchemaElement) => {
        if (element.type === 'Field') {
          return { ...element, ariaDescribedBy: 'title_1' };
        }
        return element;
      },
    );

    const updatedFormBag = updatePasswordDescribedByValue(formBag);

    expect(updatedFormBag).toMatchSnapshot();
    expect((updatedFormBag.uischema.elements[2] as UISchemaElement).ariaDescribedBy)
      .toBe('title_1 PasswordRequirements_abc123');
    expect((updatedFormBag.uischema.elements[3] as UISchemaElement).ariaDescribedBy)
      .toBe('title_1 PasswordRequirements_abc123');
  });
});
