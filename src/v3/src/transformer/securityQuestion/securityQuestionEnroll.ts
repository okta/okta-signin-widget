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

import { ControlElement, RuleEffect, SchemaBasedCondition } from '@jsonforms/core';
import { Input } from '@okta/okta-auth-js';
import get from 'lodash/get';
import set from 'lodash/set';
import { Choice, IdxStepTransformer, TitleElement } from 'src/types';

import { removeUIElementWithScope } from '../utils';

type Question = {
  questionKey: string;
  question: string;
};

const QUESTION_KEY_SCOPE = '#/properties/credentials/properties/questionKey';
const CUSTOM_QUESTION_SCOPE = '#/properties/credentials/properties/question';
const ANSWER_SCOPE = '#/properties/credentials/properties/answer';

export const transformSecurityQuestionEnroll: IdxStepTransformer = (transaction, formBag) => {
  const { nextStep: { relatesTo, inputs } } = transaction;
  if (!relatesTo?.value) {
    return formBag;
  }

  const { contextualData } = relatesTo.value;
  const { schema, uischema } = formBag;

  schema.properties = schema.properties ?? {};

  // removes default element from uischema
  uischema.elements = removeUIElementWithScope(
    '#/properties/credentials',
    uischema.elements as ControlElement[],
  );

  const answerInput = get(inputs?.[0], 'options[0].value')
    ?.find(({ name }: Input) => name === 'answer');

  if (!answerInput) {
    return formBag;
  }

  // Adding answer element to schema and elements
  set(schema, 'properties.credentials.required', ['answer', 'questionKey']);
  set(schema, 'properties.credentials.properties.answer', { type: 'string' });
  uischema.elements.unshift({
    type: 'Control',
    label: answerInput.label ?? answerInput.name,
    scope: ANSWER_SCOPE,
    options: {
      secret: true,
      inputMeta: { ...answerInput },
    },
  } as ControlElement);

  const predefinedQuestionsData: Question[] = contextualData?.questions
    || [{}] as Question[];
  const questionKeyEnum = ['custom'].concat(
    predefinedQuestionsData.map((question) => question.questionKey),
  );

  // Set up questionKey field
  set(
    schema,
    'properties.credentials.properties.questionKey',
    { type: 'string', enum: questionKeyEnum },
  );

  const predefinedQuestionsElement: ControlElement = {
    type: 'Control',
    scope: QUESTION_KEY_SCOPE,
    label: 'oie.security.question.questionKey.label',
    options: {
      format: 'dropdown',
      choices: contextualData?.questions?.map((question: Question) => ({
        key: question.questionKey,
        value: question.question,
      } as Choice)),
    },
    rule: {
      effect: RuleEffect.SHOW,
      condition: {
        scope: '#/properties/questionType',
        schema: {
          const: 'predefined',
        },
      } as SchemaBasedCondition,
    },
  };
  uischema.elements.unshift(predefinedQuestionsElement);

  // Setting up custom question field
  set(schema, 'properties.credentials.properties.question', { type: 'string' });
  const customQuestionElement: ControlElement = {
    type: 'Control',
    scope: CUSTOM_QUESTION_SCOPE,
    label: 'oie.security.question.createQuestion.label',
    rule: {
      effect: RuleEffect.SHOW,
      condition: {
        scope: '#/properties/questionType',
        schema: {
          const: 'custom',
        },
      } as SchemaBasedCondition,
    },
  };
  uischema.elements.unshift(customQuestionElement);

  schema.properties.questionType = {
    type: 'string',
    enum: ['predefined', 'custom'],
  };
  const choiceElement: ControlElement = {
    type: 'Control',
    scope: '#/properties/questionType',
    label: false,
    options: {
      format: 'radio',
      choices: [{
        key: 'predefined',
        value: 'oie.security.question.questionKey.label',
      }, {
        key: 'custom',
        value: 'oie.security.question.createQuestion.label',
      }],
      // set default choice for radio button
      defaultOption: 'predefined',
    },
  };
  uischema.elements.unshift(choiceElement);

  // Add the title to the top
  const titleElement: TitleElement = {
    type: 'Title',
    options: {
      content: 'oie.security.question.enroll.title',
    },
  };
  uischema.elements.unshift(titleElement);

  return formBag;
};
