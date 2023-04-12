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

import { getStubFormBag, getStubTransactionWithNextStep } from 'src/mocks/utils/utils';
import {
  ButtonElement,
  ButtonType,
  DescriptionElement,
  FieldElement,
  LinkElement,
  TitleElement,
  WidgetProps,
} from 'src/types';

import { transformEnrollProfileUpdate } from './transformEnrollProfileUpdate';

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
    const updatedFormBag = transformEnrollProfileUpdate({ transaction, formBag, widgetProps });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.data['userProfile.secondEmail']).toBeUndefined();
    expect(updatedFormBag.uischema.elements.length).toBe(7);
    expect(updatedFormBag.uischema.elements[0].type).toBe('Title');
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
      .toBe('oie.profile.additional.title');
    expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options?.content)
      .toBe('oie.form.field.optional.description');
    expect((updatedFormBag.uischema.elements[2] as FieldElement).options?.inputMeta.name)
      .toBe('userProfile.firstName');
    expect((updatedFormBag.uischema.elements[3] as FieldElement).options?.inputMeta.name)
      .toBe('userProfile.lastName');
    expect((updatedFormBag.uischema.elements[4] as FieldElement).options?.inputMeta.name)
      .toBe('userProfile.email');
    expect((updatedFormBag.uischema.elements[5] as ButtonElement).label)
      .toBe('enroll.choices.submit.finish');
    expect((updatedFormBag.uischema.elements[5] as ButtonElement).type).toBe('Button');
    expect((updatedFormBag.uischema.elements[5] as ButtonElement).options?.type)
      .toBe(ButtonType.SUBMIT);
    expect(updatedFormBag.uischema.elements[6].type).toBe('Link');
    expect((updatedFormBag.uischema.elements[6] as LinkElement).options.label)
      .toBe('oie.enroll.skip.profile');
    expect((updatedFormBag.uischema.elements[6] as LinkElement).options.isActionStep).toBe(false);
  });

  it('should add title, button and input elements from remediation with all optional fields when skip is missing from remediation', () => {
    transaction.availableSteps = [];

    const updatedFormBag = transformEnrollProfileUpdate({ transaction, formBag, widgetProps });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.data['userProfile.secondEmail']).toBeUndefined();
    expect(updatedFormBag.uischema.elements.length).toBe(6);
    expect(updatedFormBag.uischema.elements[0].type).toBe('Title');
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
      .toBe('oie.profile.additional.title');
    expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options?.content)
      .toBe('oie.form.field.optional.description');
    expect((updatedFormBag.uischema.elements[2] as FieldElement).options?.inputMeta.name)
      .toBe('userProfile.firstName');
    expect((updatedFormBag.uischema.elements[3] as FieldElement).options?.inputMeta.name)
      .toBe('userProfile.lastName');
    expect((updatedFormBag.uischema.elements[4] as FieldElement).options?.inputMeta.name)
      .toBe('userProfile.email');
    expect((updatedFormBag.uischema.elements[5] as ButtonElement).label)
      .toBe('enroll.choices.submit.finish');
    expect((updatedFormBag.uischema.elements[5] as ButtonElement).type).toBe('Button');
    expect((updatedFormBag.uischema.elements[5] as ButtonElement).options?.type)
      .toBe(ButtonType.SUBMIT);
  });

  it('should add title button and input elements from remediation with at least one required field', () => {
    formBag.uischema.elements.push({
      type: 'Field',
      label: 'Another field',
      options: {
        inputMeta: { name: 'userProfile.anotherField', required: true },
      },
    } as FieldElement);

    const updatedFormBag = transformEnrollProfileUpdate({ transaction, formBag, widgetProps });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.data['userProfile.secondEmail']).toBeUndefined();
    expect(updatedFormBag.uischema.elements.length).toBe(7);
    expect(updatedFormBag.uischema.elements[0].type).toBe('Title');
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
      .toBe('oie.profile.additional.title');
    expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options?.content)
      .toBe('oie.form.field.optional.description');
    expect((updatedFormBag.uischema.elements[2] as FieldElement).options?.inputMeta.name)
      .toBe('userProfile.firstName');
    expect((updatedFormBag.uischema.elements[3] as FieldElement).options?.inputMeta.name)
      .toBe('userProfile.lastName');
    expect((updatedFormBag.uischema.elements[4] as FieldElement).options?.inputMeta.name)
      .toBe('userProfile.email');
    expect((updatedFormBag.uischema.elements[5] as FieldElement).options?.inputMeta.name)
      .toBe('userProfile.anotherField');
    expect((updatedFormBag.uischema.elements[6] as ButtonElement).label)
      .toBe('enroll.choices.submit.finish');
    expect((updatedFormBag.uischema.elements[6] as ButtonElement).type).toBe('Button');
    expect((updatedFormBag.uischema.elements[6] as ButtonElement).options?.type)
      .toBe(ButtonType.SUBMIT);
  });

  it('should add title button and input elements from remediation with at least one required field and secondEmail field', () => {
    formBag.uischema.elements.push({
      type: 'Field',
      label: 'Secondary email',
      options: {
        inputMeta: { name: 'userProfile.secondEmail', required: true },
      },
    } as FieldElement);

    const updatedFormBag = transformEnrollProfileUpdate({ transaction, formBag, widgetProps });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.data['userProfile.secondEmail']).toBe('');
    expect(updatedFormBag.uischema.elements.length).toBe(7);
    expect(updatedFormBag.uischema.elements[0].type).toBe('Title');
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
      .toBe('oie.profile.additional.title');
    expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options?.content)
      .toBe('oie.form.field.optional.description');
    expect((updatedFormBag.uischema.elements[2] as FieldElement).options?.inputMeta.name)
      .toBe('userProfile.firstName');
    expect((updatedFormBag.uischema.elements[3] as FieldElement).options?.inputMeta.name)
      .toBe('userProfile.lastName');
    expect((updatedFormBag.uischema.elements[4] as FieldElement).options?.inputMeta.name)
      .toBe('userProfile.email');
    expect((updatedFormBag.uischema.elements[5] as FieldElement).options?.inputMeta.name)
      .toBe('userProfile.secondEmail');
    expect((updatedFormBag.uischema.elements[6] as ButtonElement).label)
      .toBe('enroll.choices.submit.finish');
    expect((updatedFormBag.uischema.elements[6] as ButtonElement).type).toBe('Button');
    expect((updatedFormBag.uischema.elements[6] as ButtonElement).options?.type)
      .toBe(ButtonType.SUBMIT);
  });
});
