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
import { FormBag } from 'src/types';

import { transformSecurityQuestionEnroll } from '.';

describe('SecurityQuestionEnroll Tests', () => {
  const transaction = getStubTransactionWithNextStep();
  let formBag: FormBag;
  beforeEach(() => {
    formBag = {
      envelope: {},
      data: {},
      schema: {},
      uischema: {
        type: 'VerticalLayout',
        elements: [{
          type: 'Control',
          scope: '#/properties/answer',
        } as ControlElement],
      },
    };
  });

  it('should create security question enrollment UI elements', () => {
    transaction.nextStep = {
      name: '',
      authenticator: {
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
    };
    const updatedFormBag = transformSecurityQuestionEnroll(transaction, formBag);

    expect(updatedFormBag).toMatchSnapshot();

    expect(updatedFormBag.uischema.elements.length).toBe(5);
    expect(updatedFormBag.uischema.elements[0].type).toBe('Title');

    // choice element
    expect(updatedFormBag.uischema.elements[1].type).toBe('Control');
    expect(updatedFormBag.uischema.elements[1].options?.format).toBe('radio');
    expect(updatedFormBag.uischema.elements[1].options?.choices[0].key).toBe('predefined');
    expect(updatedFormBag.uischema.elements[1].options?.choices[1].key).toBe('custom');

    // customQuestion element
    expect(updatedFormBag.uischema.elements[2].type).toBe('Control');
    expect(updatedFormBag.uischema.elements[2].rule).toEqual(expect.objectContaining({
      effect: RuleEffect.SHOW,
      condition: {
        scope: expect.any(String),
        schema: {
          const: 'custom',
        },
      },
    }));

    // predefinedQuestions element
    expect(updatedFormBag.uischema.elements[3].type).toBe('Control');
    expect(updatedFormBag.uischema.elements[3].options?.format).toBe('dropdown');
    expect(updatedFormBag.uischema.elements[3].options?.choices).toStrictEqual([{
      key: 'eternal',
      value: 'What is love?',
    }]);
    expect(updatedFormBag.uischema.elements[3].rule).toEqual(expect.objectContaining({
      effect: RuleEffect.SHOW,
      condition: {
        scope: expect.any(String),
        schema: {
          const: 'predefined',
        },
      },
    }));

    // answer element
    expect(updatedFormBag.uischema.elements[4].type).toBe('Control');
    expect(updatedFormBag.uischema.elements[4].options?.format).toBe('password');

    // ensure default questionType selection
    expect(updatedFormBag.data.questionType).toBe('predefined');

    // ensure schema enum for questionType and questionKey are correct
    expect(updatedFormBag.schema.properties?.questionType.enum).toEqual(['predefined', 'custom']);
    expect(updatedFormBag.schema.properties?.questionKey.enum).toEqual(['custom', 'eternal']);
  });
});
