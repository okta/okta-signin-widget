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

import { getStubTransactionWithNextStep } from 'src/mocks/utils/utils';
import {
  FieldElement,
  FormBag,
  UISchemaLayoutType,
  WidgetProps,
} from 'src/types';

import { transformPhoneEnrollment } from '.';

describe('PhoneEnrollmentTransformer Tests', () => {
  const transaction = getStubTransactionWithNextStep();
  const mockProps: WidgetProps = {};
  let formBag: FormBag;
  beforeEach(() => {
    formBag = {
      data: {},
      schema: {},
      uischema: {
        type: UISchemaLayoutType.VERTICAL,
        elements: [{
          type: 'Control',
          label: 'methodType',
          name: 'authenticator.methodType',
          options: {
            inputMeta: {
              name: 'authenticator.methodType',
              options: [{
                value: 'sms',
                label: 'SMS',
              }, {
                value: 'voice',
                label: 'Phone Call',
              }],
            },
          },
        } as FieldElement, {
          type: 'Control',
          label: 'Phone number',
          name: 'authenticator.phoneNumber',
        } as FieldElement],
      },
    };
  });

  it('should create phone enrollment UI elements when multiple method types exist in transaction', () => {
    const updatedFormBag = transformPhoneEnrollment(transaction, formBag, mockProps);
    expect(updatedFormBag).toMatchSnapshot();
  });

  // TODO: re-visit when add phone number client side validation
  // it's not safe to use one client side regext to validate, since phone number standard varies by regions
  // before a good hint is available from idx response, it would be safe to just depend on backend validation
  it.skip('should validate phoneNumber format', () => {
    const updatedFormBag = transformPhoneEnrollment(transaction, formBag, mockProps);

    const phoneNumberPattern = (updatedFormBag.schema as any).properties?.phoneNumber?.pattern ?? '';
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
