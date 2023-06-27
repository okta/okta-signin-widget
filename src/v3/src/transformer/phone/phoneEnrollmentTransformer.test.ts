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
  StepperLayout,
  StepperRadioElement,
  TitleElement,
  WidgetProps,
} from 'src/types';

import { transformPhoneEnrollment } from '.';

describe('PhoneEnrollmentTransformer Tests', () => {
  const transaction = getStubTransactionWithNextStep();
  const widgetProps: WidgetProps = {};
  const formBag = getStubFormBag();
  beforeEach(() => {
    formBag.uischema.elements = [
      {
        type: 'Field',
        label: 'methodType',
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
      } as FieldElement,
      {
        type: 'Field',
        label: 'Phone number',
        options: { inputMeta: { name: 'authenticator.phoneNumber' } },
      } as FieldElement,
    ];
  });

  it('should create phone enrollment UI elements when multiple method types exist in transaction', () => {
    const updatedFormBag = transformPhoneEnrollment({ transaction, formBag, widgetProps });
    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(2);
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options.content)
      .toBe('oie.phone.enroll.title');

    const [,stepperLayout] = updatedFormBag.uischema.elements;
    const [layoutOne, layoutTwo] = (stepperLayout as StepperLayout).elements;

    expect(layoutOne.elements.length).toBe(4);
    expect((layoutOne.elements[0] as DescriptionElement).options.content)
      .toBe('oie.phone.enroll.sms.subtitle');
    expect((layoutOne.elements[1] as StepperRadioElement).options.name)
      .toBe('authenticator.methodType');
    expect((layoutOne.elements[1] as StepperRadioElement).options.customOptions.length)
      .toBe(2);
    expect((layoutOne.elements[2] as FieldElement).label)
      .toBe('mfa.phoneNumber.placeholder');
    expect((layoutOne.elements[2] as FieldElement).options.inputMeta.name)
      .toBe('authenticator.phoneNumber');
    expect((layoutOne.elements[3] as ButtonElement).label)
      .toBe('oie.phone.sms.primaryButton');
    expect((layoutOne.elements[3] as ButtonElement).options.type)
      .toBe(ButtonType.SUBMIT);

    expect(layoutTwo.elements.length).toBe(4);
    expect((layoutTwo.elements[0] as DescriptionElement).options.content)
      .toBe('oie.phone.enroll.call.subtitle');
    expect((layoutTwo.elements[1] as StepperRadioElement).options.name)
      .toBe('authenticator.methodType');
    expect((layoutTwo.elements[1] as StepperRadioElement).options.customOptions.length)
      .toBe(2);
    expect((layoutTwo.elements[2] as FieldElement).label)
      .toBe('mfa.phoneNumber.placeholder');
    expect((layoutTwo.elements[2] as FieldElement).options.inputMeta.name)
      .toBe('authenticator.phoneNumber');
    expect((layoutTwo.elements[3] as ButtonElement).label)
      .toBe('oie.phone.call.primaryButton');
    expect((layoutTwo.elements[3] as ButtonElement).options.type)
      .toBe(ButtonType.SUBMIT);
  });

  it('should create phone enrollment UI elements when only sms method types exist in transaction', () => {
    formBag.uischema.elements = [
      {
        type: 'Field',
        label: 'methodType',
        options: {
          inputMeta: {
            name: 'authenticator.methodType',
            options: [{
              value: 'sms',
              label: 'SMS',
            }],
          },
        },
      } as FieldElement,
      {
        type: 'Field',
        label: 'Phone number',
        options: { inputMeta: { name: 'authenticator.phoneNumber' } },
      } as FieldElement,
    ];
    const updatedFormBag = transformPhoneEnrollment({ transaction, formBag, widgetProps });
    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(4);
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options.content)
      .toBe('oie.phone.enroll.title');
    expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options.content)
      .toBe('oie.phone.enroll.sms.subtitle');
    expect((updatedFormBag.uischema.elements[2] as FieldElement).label)
      .toBe('mfa.phoneNumber.placeholder');
    expect((updatedFormBag.uischema.elements[2] as FieldElement).options.inputMeta.name)
      .toBe('authenticator.phoneNumber');
    expect((updatedFormBag.uischema.elements[3] as ButtonElement).label)
      .toBe('oie.phone.sms.primaryButton');
    expect((updatedFormBag.uischema.elements[3] as ButtonElement).options.type)
      .toBe(ButtonType.SUBMIT);
  });

  it('should create phone enrollment UI elements when only voice method types exist in transaction', () => {
    formBag.uischema.elements = [
      {
        type: 'Field',
        label: 'methodType',
        options: {
          inputMeta: {
            name: 'authenticator.methodType',
            options: [{
              value: 'voice',
              label: 'Phone Call',
            }],
          },
        },
      } as FieldElement,
      {
        type: 'Field',
        label: 'Phone number',
        options: { inputMeta: { name: 'authenticator.phoneNumber' } },
      } as FieldElement,
    ];
    const updatedFormBag = transformPhoneEnrollment({ transaction, formBag, widgetProps });
    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(4);
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options.content)
      .toBe('oie.phone.enroll.title');
    expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options.content)
      .toBe('oie.phone.enroll.call.subtitle');
    expect((updatedFormBag.uischema.elements[2] as FieldElement).label)
      .toBe('mfa.phoneNumber.placeholder');
    expect((updatedFormBag.uischema.elements[2] as FieldElement).options.inputMeta.name)
      .toBe('authenticator.phoneNumber');
    expect((updatedFormBag.uischema.elements[3] as ButtonElement).label)
      .toBe('oie.phone.call.primaryButton');
    expect((updatedFormBag.uischema.elements[3] as ButtonElement).options.type)
      .toBe(ButtonType.SUBMIT);
  });
});
