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
  FieldElement,
  FormBag,
  WidgetProps,
} from 'src/types';

import { transformSecurityQuestionEnroll } from '.';

describe('SecurityQuestionEnroll Tests', () => {
  const transaction = getStubTransactionWithNextStep();
  const widgetProps: WidgetProps = {};
  let formBag: FormBag;

  beforeEach(() => {
    formBag = getStubFormBag();
    formBag.uischema.elements = [
      {
        type: 'Field',
        options: { inputMeta: { name: 'credentials.questionKey' } },
      } as FieldElement,
      {
        type: 'Field',
        options: { inputMeta: { name: 'credentials.question' } },
      } as FieldElement,
      {
        type: 'Field',
        options: { inputMeta: { name: 'credentials.answer', secret: true } },
      } as FieldElement,
    ];
  });

  it('should create security question enrollment UI elements', () => {
    transaction.nextStep = {
      name: '',
      inputs: [
        {
          name: 'credentials',
          options: [
            {
              label: 'Select question',
              value: [
                {
                  name: 'questionKey',
                  options: [
                    {
                      value: 'eternal',
                      label: 'What is love?',
                    },
                    {
                      value: 'fav_actor',
                      label: 'Who is your favorite actor?',
                    },
                  ],
                },
                { name: 'answer', label: 'Answer', secret: true },
              ],
            },
            {
              label: 'Enter question',
              value: [
                { name: 'question' },
                { name: 'answer', label: 'Answer', secret: true },
                { name: 'questionKey', value: 'custom' },
              ],
            },
          ],
        },
      ],
      relatesTo: {
        value: {
          contextualData: {
            questions: [
              {
                question: 'What is love?',
                questionKey: 'eternal',
              },
              {
                question: 'Who is your favorite actor?',
                questionKey: 'fav_actor',
              },
            ],
          },
        } as unknown as IdxAuthenticator,
      },
    };
    const updatedFormBag = transformSecurityQuestionEnroll({ transaction, formBag, widgetProps });

    expect(updatedFormBag).toMatchSnapshot();
  });
});
