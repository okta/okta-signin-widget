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

import { ControlElement, SchemaBasedCondition } from '@jsonforms/core';
import { getStubTransactionWithNextStep } from 'src/mocks/utils/utils';
import { FormBag, WidgetProps } from 'src/types';

import { ButtonOptionType } from '../getButtonControls';
import { transformPhoneEnrollment } from '.';

describe('PhoneEnrollmentTransformer Tests', () => {
  const transaction = getStubTransactionWithNextStep();
  const mockProps: WidgetProps = {};
  let formBag: FormBag;
  beforeEach(() => {
    formBag = {
      schema: {
        properties: {
          phoneNumber: {
            type: 'string',
            pattern: '^\\+([0-9]{5,17})(?:x(?<ext>[0-9]+))?$',
          },
        },
      },
      uischema: {
        type: 'VerticalLayout',
        elements: [{
          type: 'Control',
          label: 'methodType',
          scope: '#/properties/authenticator/properties/methodType',
          options: {
            choices: [{
              key: 'sms',
              label: 'SMS',
            }, {
              key: 'voice',
              label: 'Phone Call',
            }],
          },
        } as ControlElement, {
          type: 'Control',
          label: 'Phone number',
          scope: '#/properties/authenticator/properties/phoneNumber',
        } as ControlElement],
      },
    };
  });

  it('should create phone enrollment UI elements when multiple method types exist in transaction', () => {
    const updatedFormBag = transformPhoneEnrollment(transaction, formBag, mockProps);

    expect(updatedFormBag.uischema.elements.length).toBe(7);
    expect(updatedFormBag.uischema.elements[0].type).toBe('Title');
    expect(updatedFormBag.uischema.elements[0].options?.content).toBe('oie.phone.enroll.title');
    expect(updatedFormBag.uischema.elements[1].type).toBe('Description');
    expect(updatedFormBag.uischema.elements[1].options?.content).toBe('oie.phone.enroll.sms.subtitle');
    expect((updatedFormBag.uischema.elements[1].rule?.condition as SchemaBasedCondition).schema.const).toBe('sms');
    expect(updatedFormBag.uischema.elements[2].type).toBe('Description');
    expect(updatedFormBag.uischema.elements[2].options?.content).toBe('oie.phone.enroll.call.subtitle');
    expect((updatedFormBag.uischema.elements[2].rule?.condition as SchemaBasedCondition).schema.const).toBe('voice');
    expect((updatedFormBag.uischema.elements[3] as ControlElement).label).toBe('');
    expect(updatedFormBag.uischema.elements[3].options?.defaultOption).toBe('sms');
    expect((updatedFormBag.uischema.elements[4] as ControlElement).label).toBe('mfa.phoneNumber.placeholder');
    expect(updatedFormBag.uischema.elements[4].options?.showExt).toBe(true);
    expect(updatedFormBag.uischema.elements[4].options?.targetKey).toBe('authenticator.methodType');
    expect(updatedFormBag.uischema.elements[5].options?.type).toBe(ButtonOptionType.SUBMIT);
    expect((updatedFormBag.uischema.elements[5] as ControlElement).label).toBe('oie.phone.sms.primaryButton');
    expect((updatedFormBag.uischema.elements[5].rule?.condition as SchemaBasedCondition).schema.const).toBe('sms');
    expect(updatedFormBag.uischema.elements[6].options?.type).toBe(ButtonOptionType.SUBMIT);
    expect((updatedFormBag.uischema.elements[6] as ControlElement).label).toBe('oie.phone.call.primaryButton');
    expect((updatedFormBag.uischema.elements[6].rule?.condition as SchemaBasedCondition).schema.const).toBe('voice');

    const phoneNumberPattern = updatedFormBag.schema.properties?.phoneNumber?.pattern ?? '';
    expect(new RegExp(phoneNumberPattern).test('+12165551234')).toBe(true);
    expect(new RegExp(phoneNumberPattern).test('+12165551234x42')).toBe(true);
    expect(new RegExp(phoneNumberPattern).test('+12165551234x1')).toBe(true);
    expect(new RegExp(phoneNumberPattern).test('+12165551234x5564')).toBe(true);
    expect(new RegExp(phoneNumberPattern).test('+99855544864')).toBe(true);
    expect(new RegExp(phoneNumberPattern).test('+351557896531')).toBe(true);
    expect(new RegExp(phoneNumberPattern).test('+351557896531x9964458')).toBe(true);
    expect(new RegExp(phoneNumberPattern).test('+x453+43459344')).toBe(false);
    expect(new RegExp(phoneNumberPattern).test('abc123')).toBe(false);
    expect(new RegExp(phoneNumberPattern).test('aaaaaa')).toBe(false);
    expect(new RegExp(phoneNumberPattern).test('3151115555')).toBe(false);
    expect(new RegExp(phoneNumberPattern).test('3151115555x9')).toBe(false);
    expect(new RegExp(phoneNumberPattern).test('+154')).toBe(false);
  });
});
