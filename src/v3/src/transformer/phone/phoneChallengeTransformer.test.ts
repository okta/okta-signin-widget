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
import { getStubTransactionWithNextStep } from 'src/mocks/utils/utils';
import {
  ButtonElement,
  ButtonType,
  DescriptionElement,
  FormBag,
  UISchemaLayoutType,
  WidgetProps,
} from 'src/types';

import { transformPhoneChallenge } from '.';

describe('PhoneChallengeTransformer Tests', () => {
  const redactedPhone = '+1 XXX-XXX-4601';
  const transaction = getStubTransactionWithNextStep();
  const mockProps: WidgetProps = {};
  let formBag: FormBag;
  beforeEach(() => {
    formBag = {
      schema: {},
      uischema: {
        type: UISchemaLayoutType.VERTICAL,
        elements: [],
      },
      data: {},
      dataSchema: {},
    };
  });

  it('should create SMS challenge UI elements when resend code is available', () => {
    transaction.availableSteps = [{ name: 'resend', action: jest.fn() }];
    transaction.nextStep = {
      name: 'mock-step',
      canResend: true,
      relatesTo: {
        value: {
          profile: {
            phoneNumber: redactedPhone,
          },
          methods: [{ type: 'sms' }],
        } as unknown as IdxAuthenticator,
      },
    };
    const updatedFormBag = transformPhoneChallenge(transaction, formBag, mockProps);

    expect(updatedFormBag).toMatchSnapshot();

    expect(updatedFormBag.uischema.elements.length).toBe(5);

    expect(updatedFormBag.uischema.elements[2].type).toBe('Description');
    expect((updatedFormBag.uischema.elements[2] as DescriptionElement).options.content)
      .toBe(`oie.phone.verify.sms.codeSentText ${redactedPhone}. oie.phone.verify.enterCodeText`);

    expect(updatedFormBag.uischema.elements[3].type).toBe('Description');
    expect((updatedFormBag.uischema.elements[3] as DescriptionElement).options?.content)
      .toBe('oie.phone.carrier.charges');

    expect((updatedFormBag.uischema.elements[4] as ButtonElement).type).toBe('Button');
    expect((updatedFormBag.uischema.elements[4] as ButtonElement).options?.type)
      .toBe(ButtonType.SUBMIT);
  });

  it('should create SMS challenge UI elements when resend code is NOT available', () => {
    transaction.nextStep = {
      name: 'mock-step',
      canResend: false,
      relatesTo: {
        value: {
          profile: {
            phoneNumber: redactedPhone,
          },
          methods: [{ type: 'sms' }],
        } as unknown as IdxAuthenticator,
      },
    };
    const updatedFormBag = transformPhoneChallenge(transaction, formBag, mockProps);

    expect(updatedFormBag).toMatchSnapshot();

    expect(updatedFormBag.uischema.elements.length).toBe(4);

    expect(updatedFormBag.uischema.elements[1].type).toBe('Description');
    expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options.content)
      .toBe(`oie.phone.verify.sms.codeSentText ${redactedPhone}. oie.phone.verify.enterCodeText`);

    expect(updatedFormBag.uischema.elements[2].type).toBe('Description');
    expect((updatedFormBag.uischema.elements[2] as DescriptionElement).options?.content)
      .toBe('oie.phone.carrier.charges');

    expect((updatedFormBag.uischema.elements[3] as ButtonElement).type).toBe('Button');
    expect((updatedFormBag.uischema.elements[3] as ButtonElement).options?.type)
      .toBe(ButtonType.SUBMIT);
  });

  it('should create SMS challenge UI elements when phone number not available', () => {
    transaction.nextStep = {
      name: '',
      canResend: false,
    };
    const updatedFormBag = transformPhoneChallenge(transaction, formBag, mockProps);

    expect(updatedFormBag).toMatchSnapshot();

    expect(updatedFormBag.uischema.elements.length).toBe(4);

    expect(updatedFormBag.uischema.elements[1].type).toBe('Description');
    expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options.content)
      .toBe('oie.phone.verify.sms.codeSentText oie.phone.alternate.title. oie.phone.verify.enterCodeText');

    expect((updatedFormBag.uischema.elements[2] as DescriptionElement).type).toBe('Description');
    expect((updatedFormBag.uischema.elements[2] as DescriptionElement).options?.content)
      .toBe('oie.phone.carrier.charges');

    expect((updatedFormBag.uischema.elements[3] as ButtonElement).type).toBe('Button');
    expect((updatedFormBag.uischema.elements[3] as ButtonElement).options?.type)
      .toBe(ButtonType.SUBMIT);
  });

  it('should create voice challenge UI elements when phoneNumber not available', () => {
    transaction.nextStep = {
      name: 'mock-step',
      canResend: false,
      relatesTo: {
        value: {
          methods: [{ type: 'voice' }],
        } as unknown as IdxAuthenticator,
      },
    };
    const updatedFormBag = transformPhoneChallenge(transaction, formBag, mockProps);

    expect(updatedFormBag).toMatchSnapshot();

    expect(updatedFormBag.uischema.elements.length).toBe(4);

    expect(updatedFormBag.uischema.elements[1].type).toBe('Description');
    expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options.content)
      .toBe('mfa.calling oie.phone.alternate.title. oie.phone.verify.enterCodeText');

    expect((updatedFormBag.uischema.elements[2] as DescriptionElement).type).toBe('Description');
    expect((updatedFormBag.uischema.elements[2] as DescriptionElement).options?.content)
      .toBe('oie.phone.carrier.charges');

    expect((updatedFormBag.uischema.elements[3] as ButtonElement).type).toBe('Button');
    expect((updatedFormBag.uischema.elements[3] as ButtonElement).options?.type)
      .toBe(ButtonType.SUBMIT);
  });

  it('should create voice challenge UI elements when phoneNumber is available', () => {
    transaction.nextStep = {
      name: 'mock-step',
      canResend: false,
      relatesTo: {
        value: {
          profile: {
            phoneNumber: redactedPhone,
          },
          methods: [{ type: 'voice' }],
        } as unknown as IdxAuthenticator,
      },
    };
    const updatedFormBag = transformPhoneChallenge(transaction, formBag, mockProps);

    expect(updatedFormBag).toMatchSnapshot();

    expect(updatedFormBag.uischema.elements.length).toBe(4);

    expect(updatedFormBag.uischema.elements[1].type).toBe('Description');
    expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options.content)
      .toBe(`mfa.calling ${redactedPhone}. oie.phone.verify.enterCodeText`);

    expect((updatedFormBag.uischema.elements[2] as DescriptionElement).type).toBe('Description');
    expect((updatedFormBag.uischema.elements[2] as DescriptionElement).options?.content)
      .toBe('oie.phone.carrier.charges');

    expect((updatedFormBag.uischema.elements[3] as ButtonElement).type).toBe('Button');
    expect((updatedFormBag.uischema.elements[3] as ButtonElement).options?.type)
      .toBe(ButtonType.SUBMIT);
  });
});
