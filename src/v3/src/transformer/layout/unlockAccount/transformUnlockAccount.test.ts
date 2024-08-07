/*
 * Copyright (c) 2024-present, Okta, Inc. and/or its affiliates. All rights reserved.
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
  FieldElement, FormBag, TitleElement, WidgetProps,
} from 'src/types';

import { transformUnlockAccount } from './transformUnlockAccount';

describe('transformUnlockAccount Tests', () => {
  const transaction: IdxTransaction = getStubTransactionWithNextStep();
  const widgetProps: WidgetProps = {};
  const formBag: FormBag = getStubFormBag();

  beforeEach(() => {
    formBag.uischema.elements = [
      {
        type: 'Field',
        options: { inputMeta: { name: 'identifier' } },
      } as FieldElement,
    ];
    transaction.nextStep = {
      name: IDX_STEP.UNLOCK_ACCOUNT,
    };
  });

  it('should build unlock account view elements', () => {
    const updatedFormBag = transformUnlockAccount({
      transaction,
      formBag,
      widgetProps,
    });
    expect(updatedFormBag.uischema.elements.length).toBe(2);
    expect(updatedFormBag).toMatchSnapshot();
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options.content)
      .toBe('account.unlock.title');
    expect((updatedFormBag.uischema.elements[1] as FieldElement).options.inputMeta.name)
      .toBe('identifier');
  });
});
