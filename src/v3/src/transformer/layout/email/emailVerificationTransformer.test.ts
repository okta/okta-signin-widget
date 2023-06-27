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
  DescriptionElement,
  FieldElement,
  TitleElement,
  WidgetProps,
} from 'src/types';

import { transformEmailVerification } from '.';

describe('Email Verification Transformer Tests', () => {
  const transaction = getStubTransactionWithNextStep();
  const widgetProps: WidgetProps = {};
  const formBag = getStubFormBag();

  beforeEach(() => {
    formBag.uischema.elements = [
      {
        type: 'Field',
        options: {
          inputMeta: {
            name: 'authenticator.methodType',
            options: [{ value: 'email', label: 'Email' }],
          },
        },
      } as FieldElement,
    ];
  });

  it('should update methodType element and add appropriate UI elements to schema'
    + ' when redacted email does not exist in Idx response', () => {
    const updatedFormBag = transformEmailVerification({ transaction, formBag, widgetProps });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(3);
    expect(updatedFormBag.uischema.elements[0].type).toBe('Title');
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options.content)
      .toBe('oie.email.challenge.mfa.title');
    expect(updatedFormBag.uischema.elements[1].type).toBe('Description');
    expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options?.content)
      .toBe('oie.email.verify.subtitle.text.without.email');
    expect(((updatedFormBag.uischema.elements[2] as ButtonElement)
      .options?.actionParams?.['authenticator.methodType'])).toBe('email');
    expect((updatedFormBag.uischema.elements[2] as ButtonElement).label)
      .toBe('oie.email.verify.primaryButton');
  });

  it('should update methodType element and add appropriate UI elements to schema'
    + ' when redacted email exists in Idx response', () => {
    transaction.nextStep = {
      name: 'mock-step',
      canResend: true,
      relatesTo: {
        value: {
          profile: {
            email: 'some.xxxx@xxxx.com',
          },
        } as unknown as IdxAuthenticator,
      },
    };

    const updatedFormBag = transformEmailVerification({ transaction, formBag, widgetProps });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(3);
    expect(updatedFormBag.uischema.elements[0].type).toBe('Title');
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options.content)
      .toBe('oie.email.challenge.mfa.title');
    expect(updatedFormBag.uischema.elements[1].type).toBe('Description');
    expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options?.content)
      .toBe('oie.email.verify.subtitle.text.with.email');
    expect(((updatedFormBag.uischema.elements[2] as ButtonElement)
      .options?.actionParams?.['authenticator.methodType']))
      .toBe('email');
    expect((updatedFormBag.uischema.elements[2] as ButtonElement).label)
      .toBe('oie.email.verify.primaryButton');
  });
});
