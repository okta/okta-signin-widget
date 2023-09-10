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
import { getStubFormBag, getStubTransactionWithNextStep } from 'src/mocks/utils/utils';
import {
  ButtonElement, DescriptionElement, FieldElement, FormBag, TitleElement, WidgetProps,
} from 'src/types';
import { IDX_STEP } from 'src/constants';
import { transformDeviceCodeAuthenticator } from './transformDeviceCodeAuthenticator';

describe('transformDeviceCodeAuthenticator Tests', () => {
  let transaction: IdxTransaction;
  let widgetProps: WidgetProps;
  let formBag: FormBag;

  beforeEach(() => {
    transaction = getStubTransactionWithNextStep();
    widgetProps = {};
    formBag = getStubFormBag();
    formBag.uischema.elements = [
      {
        type: 'Field',
        options: { inputMeta: { name: 'userCode' } },
      } as FieldElement,
    ];
    transaction = {
      ...transaction,
      nextStep: {
        name: IDX_STEP.USER_CODE
      },
    };
  });

  it('should build device code view elements', () => {
    const updatedFormBag = transformDeviceCodeAuthenticator({
      transaction,
      formBag,
      widgetProps,
    });
    expect(updatedFormBag.uischema.elements.length).toBe(4);
    expect(updatedFormBag).toMatchSnapshot();
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options.content)
    .toBe('device.code.activate.title');
    expect((updatedFormBag.uischema.elements[1] as DescriptionElement).options.content)
      .toBe('device.code.activate.subtitle');
    expect((updatedFormBag.uischema.elements[2] as FieldElement).options.inputMeta.name)
      .toBe('userCode');
    expect((updatedFormBag.uischema.elements[3] as ButtonElement).label)
      .toBe('oform.next');
  })

  it('should hyphenate user code input after the 4th character', () => {
    const updatedFormBag = transformDeviceCodeAuthenticator({
      transaction,
      formBag,
      widgetProps,
    });
    expect(updatedFormBag.uischema.elements.length).toBe(4);
    expect(updatedFormBag).toMatchSnapshot();
    

  })
});
