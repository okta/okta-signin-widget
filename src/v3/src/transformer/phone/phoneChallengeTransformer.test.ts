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
import { FormBag, LayoutType } from 'src/types';

import { ButtonOptionType } from '../getButtonControls';
import { transformPhoneChallenge } from '.';

describe('PhoneChallengeTransformer Tests', () => {
  const transaction = getStubTransactionWithNextStep();
  let formBag: FormBag;
  beforeEach(() => {
    formBag = {
      envelope: {},
      data: {},
      schema: {},
      uischema: {
        type: 'VerticalLayout',
        elements: [],
      },
    };
  });

  it('should create SMS challenge UI elements when resend code is available', () => {
    transaction.nextStep = {
      canResend: true,
      authenticator: {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        profile: {
          phoneNumber: '+1 555-555-5555',
        },
      },
    };
    const updatedFormBag = transformPhoneChallenge(transaction, formBag);

    expect(updatedFormBag).toMatchSnapshot();

    expect(updatedFormBag.uischema.elements.length).toBe(5);

    expect(updatedFormBag.uischema.type).toBe(LayoutType.VERTICAL);

    expect(updatedFormBag.uischema.elements[2].type).toBe('Description');
    expect(updatedFormBag.uischema.elements[2].options?.content).toBe('next.phone.challenge.sms.informationalTextWithPhone');
    expect(updatedFormBag.uischema.elements[2].options?.contentParams?.[0]).toBe('+1 555-555-5555');

    expect(updatedFormBag.uischema.elements[3].type).toBe('Description');
    expect(updatedFormBag.uischema.elements[3].options?.content).toBe('oie.phone.carrier.charges');

    expect(updatedFormBag.uischema.elements[4].options?.format).toBe('button');
    expect(updatedFormBag.uischema.elements[4].options?.type).toBe(ButtonOptionType.SUBMIT);
  });

  it('should create SMS challenge UI elements when resend code is NOT available', () => {
    transaction.nextStep = {
      canResend: false,
      authenticator: {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        profile: {
          phoneNumber: '+1 555-555-5555',
        },
      },
    };
    const updatedFormBag = transformPhoneChallenge(transaction, formBag);

    expect(updatedFormBag).toMatchSnapshot();

    expect(updatedFormBag.uischema.elements.length).toBe(4);

    expect(updatedFormBag.uischema.type).toBe(LayoutType.VERTICAL);

    expect(updatedFormBag.uischema.elements[1].type).toBe('Description');
    expect(updatedFormBag.uischema.elements[1].options?.content).toBe('next.phone.challenge.sms.informationalTextWithPhone');
    expect(updatedFormBag.uischema.elements[1].options?.contentParams?.[0]).toBe('+1 555-555-5555');

    expect(updatedFormBag.uischema.elements[2].type).toBe('Description');
    expect(updatedFormBag.uischema.elements[2].options?.content).toBe('oie.phone.carrier.charges');

    expect(updatedFormBag.uischema.elements[3].options?.format).toBe('button');
    expect(updatedFormBag.uischema.elements[3].options?.type).toBe(ButtonOptionType.SUBMIT);
  });
});
