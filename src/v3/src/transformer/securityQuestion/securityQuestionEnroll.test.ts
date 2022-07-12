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
import { getStubTransactionWithNextStep } from 'src/mocks/utils/utils';
import {
  ButtonElement,
  ButtonType,
  FieldElement,
  FormBag,
  StepperLayout,
  StepperRadioElement,
  TitleElement,
  UISchemaLayout,
  UISchemaLayoutType,
  WidgetProps,
} from 'src/types';

import { transformSecurityQuestionEnroll } from '.';

describe('SecurityQuestionEnroll Tests', () => {
  const transaction = getStubTransactionWithNextStep();
  const mockProps: WidgetProps = {};
  let formBag: FormBag;
  beforeEach(() => {
    formBag = {
      schema: { properties: { credentials: { type: 'object' } } },
      uischema: {
        type: UISchemaLayoutType.VERTICAL,
        elements: [{
          type: 'Control',
          name: 'credentials',
        } as FieldElement],
      },
      data: {},
    };
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
              value: [{ name: 'questionKey' }, { name: 'answer', label: 'Answer', secret: true }],
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
            questions: [{
              question: 'What is love?',
              questionKey: 'eternal',
            }],
          },
        } as unknown as IdxAuthenticator,
      },
    };
    const updatedFormBag = transformSecurityQuestionEnroll(transaction, formBag, mockProps);

    expect(updatedFormBag).toMatchSnapshot();

    expect(updatedFormBag.uischema.elements.length).toBe(3);
    expect((updatedFormBag.uischema.elements[0] as TitleElement).type).toBe('Title');
    expect((updatedFormBag.uischema.elements[0] as TitleElement).options?.content)
      .toBe('oie.security.question.enroll.title');

    expect((updatedFormBag.uischema.elements[1] as StepperRadioElement).type).toBe('StepperRadio');
    expect((updatedFormBag.uischema.elements[1] as StepperRadioElement).options?.customOptions)
      .toEqual([{
        value: 'predefined',
        label: 'oie.security.question.questionKey.label',
      }, {
        key: 'credentials.questionKey',
        value: 'custom',
        label: 'oie.security.question.createQuestion.label',
      }]);

    // stepper
    const stepperLayout = (updatedFormBag.uischema.elements[2] as StepperLayout);
    const predefinedQuestionElements = stepperLayout.elements[0] as UISchemaLayout;
    const customQuestionElements = stepperLayout.elements[1] as UISchemaLayout;

    // predefinedQuestions elements
    expect(predefinedQuestionElements.elements[0].type).toBe('Control');
    expect((predefinedQuestionElements.elements[0] as FieldElement).label)
      .toBe('oie.security.question.questionKey.label');
    expect((predefinedQuestionElements.elements[0] as FieldElement).name)
      .toBe('credentials.questionKey');
    expect((predefinedQuestionElements.elements[0] as FieldElement).options?.inputMeta?.name)
      .toBe('credentials.questionKey');
    expect((predefinedQuestionElements.elements[0] as FieldElement).options?.format)
      .toBe('dropdown');
    expect((predefinedQuestionElements.elements[0] as FieldElement).options?.customOptions)
      .toEqual([{
        label: 'What is love?',
        value: 'eternal',
      }]);

    expect(predefinedQuestionElements.elements[1].type).toBe('Control');
    expect((predefinedQuestionElements.elements[1] as FieldElement).name)
      .toBe('credentials.answer');
    expect((predefinedQuestionElements.elements[1] as FieldElement).label)
      .toBe('Answer');
    expect((predefinedQuestionElements.elements[1] as FieldElement).options?.inputMeta?.name)
      .toBe('credentials.answer');
    expect((predefinedQuestionElements.elements[1] as FieldElement).options?.inputMeta?.secret)
      .toBe(true);

    expect(predefinedQuestionElements.elements[2].type).toBe('Button');
    expect((predefinedQuestionElements.elements[2] as ButtonElement).label).toBe('mfa.challenge.verify');
    expect((predefinedQuestionElements.elements[2] as ButtonElement).options?.dataType).toBe('save');
    expect((predefinedQuestionElements.elements[2] as ButtonElement).options?.type)
      .toBe(ButtonType.SUBMIT);

    // customQuestion elements
    expect(customQuestionElements.elements[0].type).toBe('Control');
    expect((customQuestionElements.elements[0] as FieldElement).name)
      .toBe('credentials.questionKey');
    expect((customQuestionElements.elements[0] as FieldElement).options?.inputMeta?.name)
      .toBe('credentials.questionKey');

    expect(customQuestionElements.elements[1].type).toBe('Control');
    expect((customQuestionElements.elements[1] as FieldElement).name)
      .toBe('credentials.question');
    expect((customQuestionElements.elements[1] as FieldElement).label)
      .toBe('oie.security.question.createQuestion.label');
    expect((customQuestionElements.elements[1] as FieldElement).options?.inputMeta?.name)
      .toBe('credentials.question');

    expect(customQuestionElements.elements[2].type).toBe('Control');
    expect((customQuestionElements.elements[2] as FieldElement).name)
      .toBe('credentials.answer');
    expect((customQuestionElements.elements[2] as FieldElement).label)
      .toBe('Answer');
    expect((customQuestionElements.elements[2] as FieldElement).options?.inputMeta?.name)
      .toBe('credentials.answer');
    expect((customQuestionElements.elements[2] as FieldElement).options?.inputMeta?.secret)
      .toBe(true);

    expect(customQuestionElements.elements[3].type).toBe('Button');
    expect((customQuestionElements.elements[3] as ButtonElement).label).toBe('mfa.challenge.verify');
    expect((customQuestionElements.elements[3] as ButtonElement).options?.dataType).toBe('save');
    expect((customQuestionElements.elements[3] as ButtonElement).options?.type).toBe('submit');
    expect((customQuestionElements.elements[3] as ButtonElement).options?.idxMethodParams)
      .toEqual({ 'credentials.questionKey': 'custom' });
  });
});
