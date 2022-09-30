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
  FieldElement,
  WidgetProps,
} from 'src/types';

import { transformEmailChallengeConsent } from '.';

describe('EmailChallengeConsentTransformer Tests', () => {
  const transaction = getStubTransactionWithNextStep();
  const widgetProps: WidgetProps = {};
  const formBag = getStubFormBag('email-challenge-consent');

  beforeEach(() => {
    formBag.uischema.elements = [
      { type: 'Field', options: { inputMeta: { name: 'consent' } } } as FieldElement,
    ];
    transaction.nextStep = {
      name: 'email-challenge-consent',
      action: jest.fn(),
      // @ts-ignore requestInfo missing from NextStep interface
      requestInfo: [{
        name: 'appName',
        value: 'Okta Dashboard',
      }, {
        name: 'browser',
        value: 'CHROME',
      }],
    };
  });

  it('should create email consent ui elements with valid response', () => {
    const updatedFormBag = transformEmailChallengeConsent({ transaction, formBag, widgetProps });

    expect(updatedFormBag.uischema.elements.length).toBe(5);
    expect(updatedFormBag).toMatchSnapshot();
  });
});
