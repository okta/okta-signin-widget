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

import { IDX_STEP } from 'src/constants';
import { getStubFormBag, getStubTransactionWithNextStep } from 'src/mocks/utils/utils';
import {
  TitleElement,
  WidgetProps,
} from 'src/types';

import { transformSymantecVipAuthenticator } from '.';

describe('SymantecVip Authenticator Transformer Tests', () => {
  let transaction = getStubTransactionWithNextStep();
  let widgetProps: WidgetProps = {};
  let formBag = getStubFormBag();

  beforeEach(() => {
    transaction = getStubTransactionWithNextStep();
    formBag = getStubFormBag();
    formBag.uischema.elements = [
      {
        type: 'Field',
        label: 'Fake Label 1',
      },
      {
        type: 'Field',
        label: 'Fake Label 2',
      },
    ];
    widgetProps = {};
  });

  it('should have correct elements in enroll flow', () => {
    transaction.nextStep!.name = IDX_STEP.ENROLL_AUTHENTICATOR;
    const updatedFormBag = transformSymantecVipAuthenticator({
      transaction,
      formBag,
      widgetProps,
    });
    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(5);
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
      .toBe('oie.symantecVip.enroll.title');
  });

  it('should have correct elements in verify flow', () => {
    transaction.nextStep!.name = IDX_STEP.CHALLENGE_AUTHENTICATOR;
    const updatedFormBag = transformSymantecVipAuthenticator({
      transaction,
      formBag,
      widgetProps,
    });
    expect(updatedFormBag).toMatchSnapshot();
    expect(updatedFormBag.uischema.elements.length).toBe(5);
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
      .toBe('oie.symantecVip.challenge.title');
  });
});
