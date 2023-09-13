/*
 * Copyright (c) 2023-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { IdxTransaction } from '@okta/okta-auth-js';
import { IDX_STEP } from 'src/constants';
import { getStubFormBag, getStubTransactionWithNextStep } from 'src/mocks/utils/utils';
import {
  DescriptionElement, FieldElement, FormBag, TitleElement, WidgetProps,
} from 'src/types';

import { transformDeviceCodeAuthenticator } from './transformDeviceCodeAuthenticator';

describe('transformDeviceCodeAuthenticator Tests', () => {
  const transaction: IdxTransaction = getStubTransactionWithNextStep();
  const widgetProps: WidgetProps = {};
  const formBag: FormBag = getStubFormBag();

  beforeEach(() => {
    formBag.uischema.elements = [
      {
        type: 'Field',
        inputMask: {
          pattern: /^([A-Za-z0-9]{4})([A-Za-z0-9])/,
          replacement: '$1-$2',
        },
        options: { inputMeta: { name: 'userCode' } },
      } as FieldElement,
    ];
    transaction.nextStep = {
      name: IDX_STEP.USER_CODE,
    };
  });

  it('should build device code view elements', () => {
    const updatedFormBag = transformDeviceCodeAuthenticator({
      transaction,
      formBag,
      widgetProps,
    });
    // Since this flow sets showDefaultSubmit: true for buttonConfig, ButtonElement does not appear in uischema
    expect(updatedFormBag.uischema.elements.length).toBe(3);
    expect(updatedFormBag).toMatchSnapshot();
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options.content)
      .toBe('device.code.activate.title');
    expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options.content)
      .toBe('device.code.activate.subtitle');
    expect((updatedFormBag.uischema.elements[2] as FieldElement).options.inputMeta.name)
      .toBe('userCode');
  });
});
