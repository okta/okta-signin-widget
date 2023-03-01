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
  TitleElement,
  WidgetProps,
} from 'src/types';

import { transformGoogleAuthenticatorVerify } from './transformGoogleAuthenticatorVerify';

describe('Google Authenticator Verify Transformer Tests', () => {
  const transaction = getStubTransactionWithNextStep();
  const widgetProps: WidgetProps = {};
  const formBag = getStubFormBag();

  beforeEach(() => {
    formBag.uischema.elements = [
      { type: 'Field', options: { inputMeta: { name: 'credentials.passcode' } } } as FieldElement,
    ];
  });

  it('should add UI elements', () => {
    const updatedFormBag = transformGoogleAuthenticatorVerify({
      transaction, formBag, widgetProps,
    });

    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(4);
    expect(updatedFormBag.uischema.elements[0]?.type).toBe('Title');
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options.content)
      .toBe('oie.verify.google_authenticator.otp.title');
    expect(updatedFormBag.uischema.elements[1]?.type).toBe('Description');
    expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options.content)
      .toBe('oie.verify.google_authenticator.otp.description');
    expect((updatedFormBag.uischema.elements[2] as FieldElement).options?.inputMeta.name)
      .toBe('credentials.passcode');
    expect((updatedFormBag.uischema.elements[3] as ButtonElement).options?.type)
      .toBe(ButtonType.SUBMIT);
  });
});
