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
  ButtonType,
  FieldElement,
  FormBag,
  StepperLayout,
  StepperRadioElement,
  TitleElement,
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
                      label: 'What is the food you least liked as a child?',
                      value: 'disliked_food',
                    },
                    {
                      label: 'What is the name of your first stuffed animal?',
                      value: 'name_of_first_plush_toy',
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
                question: 'What is the food you least liked as a child?',
                questionKey: 'disliked_food',
              },
              {
                question: 'What is the name of your first stuffed animal?',
                questionKey: 'name_of_first_plush_toy',
              },
            ],
          },
        } as unknown as IdxAuthenticator,
      },
    };
    const updatedFormBag = transformSecurityQuestionEnroll({ transaction, formBag, widgetProps });

    expect(updatedFormBag).toMatchSnapshot();

    const [stepperLayout] = updatedFormBag.uischema.elements;

    const [layoutOne, layoutTwo] = (stepperLayout as StepperLayout).elements;

    expect(layoutOne.elements.length).toBe(5);
    expect((layoutOne.elements[0] as TitleElement).options.content)
      .toBe('oie.security.question.enroll.title');
    expect(layoutOne.elements[1].type).toBe('StepperRadio');
    expect((layoutOne.elements[1] as StepperRadioElement).options.customOptions.length)
      .toBe(2);
    expect((layoutOne.elements[1] as StepperRadioElement).options.name)
      .toBe('questionType');

    expect((layoutOne.elements[2] as FieldElement).label)
      .toBe('oie.security.question.questionKey.label');
    expect((layoutOne.elements[2] as FieldElement).options.customOptions?.length)
      .toBe(2);
    expect((layoutOne.elements[2] as FieldElement).options.format)
      .toBe('select');
    expect((layoutOne.elements[2] as FieldElement).options.inputMeta.name)
      .toBe('credentials.questionKey');

    expect((layoutOne.elements[3] as FieldElement).options.inputMeta.name)
      .toBe('credentials.answer');
    expect((layoutOne.elements[3] as FieldElement).options.inputMeta.secret)
      .toBe(true);
    expect((layoutOne.elements[3] as FieldElement).noTranslate)
      .toBe(true);
    expect((layoutOne.elements[4] as ButtonElement).label)
      .toBe('mfa.challenge.verify');
    expect((layoutOne.elements[4] as ButtonElement).options.includeImmutableData)
      .toBe(false);
    expect((layoutOne.elements[4] as ButtonElement).options.type)
      .toBe(ButtonType.SUBMIT);

    expect(layoutTwo.elements.length).toBe(5);
    expect((layoutTwo.elements[0] as TitleElement).options.content)
      .toBe('oie.security.question.enroll.title');
    expect(layoutTwo.elements[1].type).toBe('StepperRadio');
    expect((layoutTwo.elements[1] as StepperRadioElement).options.customOptions.length)
      .toBe(2);
    expect((layoutTwo.elements[1] as StepperRadioElement).options.name)
      .toBe('questionType');

    expect((layoutTwo.elements[2] as FieldElement).label)
      .toBe('oie.security.question.createQuestion.label');
    expect((layoutTwo.elements[2] as FieldElement).options.inputMeta.name)
      .toBe('credentials.question');

    expect((layoutTwo.elements[3] as FieldElement).options.inputMeta.name)
      .toBe('credentials.answer');
    expect((layoutTwo.elements[3] as FieldElement).options.inputMeta.secret)
      .toBe(true);
    expect((layoutOne.elements[3] as FieldElement).noTranslate)
      .toBe(true);
    expect((layoutTwo.elements[4] as ButtonElement).label)
      .toBe('mfa.challenge.verify');
    expect((layoutTwo.elements[4] as ButtonElement).options.actionParams)
      .toEqual({ 'credentials.questionKey': 'custom' });
    expect((layoutTwo.elements[4] as ButtonElement).options.type)
      .toBe(ButtonType.SUBMIT);
  });
});
