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
import { FormBag, WidgetProps } from 'src/types';

import { ButtonOptionType } from '../getButtonControls';
import { transformPhoneCodeEnrollment } from '.';

describe('PhoneEnrollmentCodeTransformer Tests', () => {
  const transaction = getStubTransactionWithNextStep();
  const mockProps: WidgetProps = {};
  let formBag: FormBag;
  beforeEach(() => {
    formBag = {
      schema: {},
      uischema: {
        type: 'VerticalLayout',
        elements: [],
      },
    };
  });

  it('should create phone code enrollment UI elements with voice as the first method type', () => {
    transaction.nextStep = {
      name: '',
      authenticator: {
        id: '',
        displayName: '',
        key: '',
        type: '',
        methods: [{ type: 'voice' }, { type: 'sms' }],
      },
    };
    const updatedFormBag = transformPhoneCodeEnrollment(transaction, formBag, mockProps);

    expect(updatedFormBag.uischema.elements.length).toBe(4);
    expect(updatedFormBag.uischema.elements[0].type).toBe('Title');
    expect(updatedFormBag.uischema.elements[1].type).toBe('Description');
    expect(updatedFormBag.uischema.elements[1].options?.content).toBe('next.phone.verify.voice.calling');
    expect(updatedFormBag.uischema.elements[2].type).toBe('Description');
    expect(updatedFormBag.uischema.elements[2].options?.content).toBe('oie.phone.carrier.charges');
    expect(updatedFormBag.uischema.elements[3].options?.type).toBe(ButtonOptionType.SUBMIT);
  });

  it('should create phone code enrollment UI elements with sms as the first method type', () => {
    transaction.nextStep = {
      name: '',
      authenticator: {
        id: '',
        displayName: '',
        key: '',
        type: '',
        methods: [{ type: 'sms' }, { type: 'voice' }],
      },
    };
    const updatedFormBag = transformPhoneCodeEnrollment(transaction, formBag, mockProps);

    expect(updatedFormBag.uischema.elements.length).toBe(4);
    expect(updatedFormBag.uischema.elements[0].type).toBe('Title');
    expect(updatedFormBag.uischema.elements[1].type).toBe('Description');
    expect(updatedFormBag.uischema.elements[1].options?.content).toBe('next.phone.verify.sms.codeSentText');
    expect(updatedFormBag.uischema.elements[2].type).toBe('Description');
    expect(updatedFormBag.uischema.elements[2].options?.content).toBe('oie.phone.carrier.charges');
    expect(updatedFormBag.uischema.elements[3].options?.type).toBe(ButtonOptionType.SUBMIT);
  });
});
