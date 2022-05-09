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
import { Choice, IdxStepTransformer, TitleElement } from 'src/types';

import { getUIElementWithScope, removeUIElementWithScope } from '../utils';

export const transformSecurityQuestionEnroll: IdxStepTransformer = (transaction, formBag) => {
  const { nextStep: { authenticator } } = transaction;
  const { schema, uischema, data } = formBag;

  schema.properties = schema.properties ?? {};
  uischema.elements = removeUIElementWithScope('#/properties/questionKey', uischema.elements as ControlElement[]);

  const answerElement = getUIElementWithScope('#/properties/answer', uischema.elements as ControlElement[]);
  if (answerElement) {
    answerElement.options = {
      format: 'password',
    };
  }

  const predefinedQuestionsData: Record<string, string>[] = authenticator?.contextualData?.questions
    || [{}];
  const questionKeyEnum = ['custom'].concat(
    predefinedQuestionsData.map((question) => question.questionKey),
  );

  // Set up questionKey field
  schema.properties.questionKey = {
    type: 'string',
    enum: questionKeyEnum,
  };
  const predefinedQuestionsElement: ControlElement = {
    type: 'Control',
    scope: '#/properties/questionKey',
    label: 'oie.security.question.questionKey.label',
    options: {
      format: 'dropdown',
      choices: authenticator?.contextualData?.questions?.map((question) => ({
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

  // remove custom question entry field by default and replace with ours
  uischema.elements = removeUIElementWithScope('#/properties/question', uischema.elements as ControlElement[]);
  const customQuestionElement: ControlElement = {
    type: 'Control',
    scope: '#/properties/question',
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
    },
  };
  // set default choice for radio button
  data.questionType = 'predefined';
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
