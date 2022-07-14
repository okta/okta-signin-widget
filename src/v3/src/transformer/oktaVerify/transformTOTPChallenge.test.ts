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
  ButtonElement,
  ButtonType,
  FieldElement,
  FormBag,
  TitleElement,
  UISchemaLayoutType,
  WidgetProps,
} from 'src/types';

import { transformTOTPChallenge } from './transformTOTPChallenge';

describe('Transform Okta Verify Totp Challenge Tests', () => {
  const transaction = getStubTransactionWithNextStep();
  let formBag: FormBag;
  const mockProps: WidgetProps = {};

  beforeEach(() => {
    formBag = {
      data: {},
      schema: {},
      uischema: {
        type: UISchemaLayoutType.VERTICAL,
        elements: [
          {
            type: 'Control',
            name: 'credentials.totp',
            label: 'Enter Code',
          } as FieldElement,
        ],
      },
    };
  });

  it('should build UI elements for OV TOTP remediation', () => {
    const updatedFormBag = transformTOTPChallenge(transaction, formBag, mockProps);

    expect(updatedFormBag.uischema.elements.length).toBe(3);
    expect(updatedFormBag.uischema.elements[0].type).toBe('Title');
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
      .toBe('oie.okta_verify.totp.title');
    expect((updatedFormBag.uischema.elements[1] as FieldElement).label)
      .toBe('oie.okta_verify.totp.enterCodeText');
    expect((updatedFormBag.uischema.elements[2] as ButtonElement).label)
      .toBe('mfa.challenge.verify');
    expect((updatedFormBag.uischema.elements[2] as ButtonElement).type)
      .toBe('Button');
    expect((updatedFormBag.uischema.elements[2] as ButtonElement).options?.type)
      .toBe(ButtonType.SUBMIT);
  });
});
