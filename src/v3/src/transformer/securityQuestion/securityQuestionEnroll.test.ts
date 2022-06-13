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

import { ControlElement, RuleEffect } from '@jsonforms/core';
import { getStubTransactionWithNextStep } from 'src/mocks/utils/utils';
import { FormBag, WidgetProps } from 'src/types';

import { transformSecurityQuestionEnroll } from '.';

describe('SecurityQuestionEnroll Tests', () => {
  const transaction = getStubTransactionWithNextStep();
  const mockProps: WidgetProps = {};
  let formBag: FormBag;
  beforeEach(() => {
    formBag = {
      schema: { properties: { credentials: { type: 'object' } } },
      uischema: {
        type: 'VerticalLayout',
        elements: [{
          type: 'Control',
          scope: '#/properties/credentials',
        } as ControlElement],
      },
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
          id: '',
          displayName: '',
          key: '',
          type: '',
          methods: [],
        },
      },
    };
    const updatedFormBag = transformSecurityQuestionEnroll(transaction, formBag, mockProps);

    expect(updatedFormBag).toMatchSnapshot();

    expect(updatedFormBag.uischema.elements.length).toBe(5);
    expect(updatedFormBag.uischema.elements[0].type).toBe('Title');
    expect(updatedFormBag.uischema.elements[0].options?.content)
      .toBe('oie.security.question.enroll.title');

    // choice element
    expect(updatedFormBag.uischema.elements[1].type).toBe('Control');
    expect(updatedFormBag.uischema.elements[1].options?.format).toBe('radio');
    // ensure default questionType selection
    expect(updatedFormBag.uischema.elements[1].options?.defaultOption).toBe('predefined');
    expect(updatedFormBag.uischema.elements[1].options?.choices[0].key).toBe('predefined');
    expect(updatedFormBag.uischema.elements[1].options?.choices[1].key).toBe('custom');

    // customQuestion element
    expect(updatedFormBag.uischema.elements[2].type).toBe('Control');
    expect((updatedFormBag.uischema.elements[2] as ControlElement).label)
      .toBe('oie.security.question.createQuestion.label');
    expect((updatedFormBag.uischema.elements[2] as ControlElement).scope)
      .toBe('#/properties/credentials/properties/question');
    expect(updatedFormBag.uischema.elements[2].rule).toEqual(expect.objectContaining({
      effect: RuleEffect.SHOW,
      condition: {
        scope: '#/properties/questionType',
        schema: {
          const: 'custom',
        },
      },
    }));

    // predefinedQuestions element
    expect(updatedFormBag.uischema.elements[3].type).toBe('Control');
    expect((updatedFormBag.uischema.elements[3] as ControlElement).label)
      .toBe('oie.security.question.questionKey.label');
    expect((updatedFormBag.uischema.elements[3] as ControlElement).scope)
      .toBe('#/properties/credentials/properties/questionKey');
    expect(updatedFormBag.uischema.elements[3].options?.format).toBe('dropdown');
    expect(updatedFormBag.uischema.elements[3].options?.choices).toStrictEqual([{
      key: 'eternal',
      value: 'What is love?',
    }]);
    expect(updatedFormBag.uischema.elements[3].rule).toEqual(expect.objectContaining({
      effect: RuleEffect.SHOW,
      condition: {
        scope: '#/properties/questionType',
        schema: {
          const: 'predefined',
        },
      },
    }));

    // answer element
    expect(updatedFormBag.uischema.elements[4].type).toBe('Control');
    expect((updatedFormBag.uischema.elements[4] as ControlElement).label)
      .toBe('Answer');
    expect((updatedFormBag.uischema.elements[4] as ControlElement).scope)
      .toBe('#/properties/credentials/properties/answer');
    expect(updatedFormBag.uischema.elements[4].options?.secret).toBe(true);

    // ensure schema enum for questionType and questionKey are correct
    expect(updatedFormBag.schema.properties?.questionType.enum).toEqual(['predefined', 'custom']);
    expect(updatedFormBag.schema.properties?.credentials?.properties?.questionKey.enum)
      .toEqual(['custom', 'eternal']);

    expect(updatedFormBag.schema.properties?.credentials?.required)
      .toEqual(['answer', 'questionKey']);
    expect(updatedFormBag.schema.properties?.credentials?.properties?.answer?.type)
      .toBe('string');
    expect(updatedFormBag.schema.properties?.credentials?.properties?.questionKey?.type)
      .toBe('string');
    expect(updatedFormBag.schema.properties?.credentials?.properties?.questionKey?.enum)
      .toEqual(['custom', 'eternal']);
    expect(updatedFormBag.schema.properties?.credentials?.properties?.question?.type)
      .toBe('string');
  });
});
