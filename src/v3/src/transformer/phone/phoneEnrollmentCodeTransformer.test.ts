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
  DescriptionElement,
  TitleElement,
  WidgetProps,
} from 'src/types';

import { transformPhoneCodeEnrollment } from '.';

describe('PhoneEnrollmentCodeTransformer Tests', () => {
  const transaction = getStubTransactionWithNextStep();
  const widgetProps: WidgetProps = {};
  const formBag = getStubFormBag();
  beforeEach(() => {
    formBag.uischema.elements = [];
  });

  it('should create phone code enrollment UI elements with voice as the first method type', () => {
    transaction.nextStep = {
      name: '',
      relatesTo: {
        value: {
          methods: [{ type: 'voice' }, { type: 'sms' }],
        } as IdxAuthenticator,
      },
    };
    const updatedFormBag = transformPhoneCodeEnrollment({ transaction, formBag, widgetProps });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(4);
    expect(updatedFormBag.uischema.elements[0].type).toBe('Title');
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options.content)
      .toBe('oie.phone.enroll.title');
    expect(updatedFormBag.uischema.elements[1].type).toBe('Description');
    expect((updatedFormBag.uischema.elements[1] as DescriptionElement)
      .options?.content).toBe('mfa.calling oie.phone.alternate.title. oie.phone.verify.enterCodeText');
    expect((updatedFormBag.uischema.elements[2] as DescriptionElement).type).toBe('Description');
    expect((updatedFormBag.uischema.elements[2] as DescriptionElement).options?.content)
      .toBe('oie.phone.carrier.charges');
    expect((updatedFormBag.uischema.elements[3] as ButtonElement).options?.type)
      .toBe(ButtonType.SUBMIT);
    expect((updatedFormBag.uischema.elements[3] as ButtonElement).label)
      .toBe('mfa.challenge.verify');
  });

  it('should create phone code enrollment UI elements with sms as the first method type', () => {
    transaction.nextStep = {
      name: '',
      relatesTo: {
        value: {
          methods: [{ type: 'sms' }, { type: 'voice' }],
        } as IdxAuthenticator,
      },
    };
    const updatedFormBag = transformPhoneCodeEnrollment({ transaction, formBag, widgetProps });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(4);
    expect(updatedFormBag.uischema.elements[0].type).toBe('Title');
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options.content)
      .toBe('oie.phone.enroll.title');
    expect(updatedFormBag.uischema.elements[1].type).toBe('Description');
    expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options?.content)
      .toBe('oie.phone.verify.sms.codeSentText oie.phone.alternate.title. oie.phone.verify.enterCodeText');
    expect(updatedFormBag.uischema.elements[2].type).toBe('Description');
    expect((updatedFormBag.uischema.elements[2] as DescriptionElement).options.content)
      .toBe('oie.phone.carrier.charges');
    expect((updatedFormBag.uischema.elements[3] as ButtonElement).options?.type)
      .toBe(ButtonType.SUBMIT);
    expect((updatedFormBag.uischema.elements[3] as ButtonElement).label)
      .toBe('mfa.challenge.verify');
  });

  it('should create phone code enrollment UI elements with sms as the first method type and phoneNumber in profile', () => {
    const mockPhoneNumber = '1215XXXXXX8';
    transaction.nextStep = {
      name: '',
      relatesTo: {
        value: {
          methods: [{ type: 'sms' }, { type: 'voice' }],
          profile: { phoneNumber: mockPhoneNumber },
        } as unknown as IdxAuthenticator,
      },
    };
    const updatedFormBag = transformPhoneCodeEnrollment({ transaction, formBag, widgetProps });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(4);
    expect(updatedFormBag.uischema.elements[0].type).toBe('Title');
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options.content)
      .toBe('oie.phone.enroll.title');
    expect(updatedFormBag.uischema.elements[1].type).toBe('Description');
    expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options?.content)
      .toBe(`oie.phone.verify.sms.codeSentText <span class="strong no-translate">&lrm;${mockPhoneNumber}.</span> oie.phone.verify.enterCodeText`);
    expect(updatedFormBag.uischema.elements[2].type).toBe('Description');
    expect((updatedFormBag.uischema.elements[2] as DescriptionElement).options.content)
      .toBe('oie.phone.carrier.charges');
    expect((updatedFormBag.uischema.elements[3] as ButtonElement).options?.type)
      .toBe(ButtonType.SUBMIT);
    expect((updatedFormBag.uischema.elements[3] as ButtonElement).label)
      .toBe('mfa.challenge.verify');
  });

  it('should create phone code enrollment UI elements with voice as the first method type and phoneNumber in profile', () => {
    const mockPhoneNumber = '1215XXXXXX8';
    transaction.nextStep = {
      name: '',
      relatesTo: {
        value: {
          methods: [{ type: 'voice' }, { type: 'sms' }],
          profile: { phoneNumber: mockPhoneNumber },
        } as unknown as IdxAuthenticator,
      },
    };
    const updatedFormBag = transformPhoneCodeEnrollment({ transaction, formBag, widgetProps });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(4);
    expect(updatedFormBag.uischema.elements[0].type).toBe('Title');
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options.content)
      .toBe('oie.phone.enroll.title');
    expect(updatedFormBag.uischema.elements[1].type).toBe('Description');
    expect((updatedFormBag.uischema.elements[1] as DescriptionElement)
      .options?.content).toBe(`mfa.calling <span class="strong no-translate">&lrm;${mockPhoneNumber}.</span> oie.phone.verify.enterCodeText`);
    expect((updatedFormBag.uischema.elements[2] as DescriptionElement).type).toBe('Description');
    expect((updatedFormBag.uischema.elements[2] as DescriptionElement).options?.content)
      .toBe('oie.phone.carrier.charges');
    expect((updatedFormBag.uischema.elements[3] as ButtonElement).options?.type)
      .toBe(ButtonType.SUBMIT);
    expect((updatedFormBag.uischema.elements[3] as ButtonElement).label)
      .toBe('mfa.challenge.verify');
  });
});
