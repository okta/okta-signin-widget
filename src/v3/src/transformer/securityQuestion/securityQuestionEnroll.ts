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

import { Input, NextStep } from '@okta/okta-auth-js';
import { IdxOption } from '@okta/okta-auth-js/lib/idx/types/idx-js';
import { loc } from 'okta';

import {
  ButtonElement,
  ButtonType,
  FieldElement,
  IdxStepTransformer,
  StepperLayout,
  StepperRadioElement,
  TitleElement,
  UISchemaLayout,
  UISchemaLayoutType,
} from '../../types';

type Question = {
  questionKey: string;
  question: string;
};

const QUESTION_KEY_INPUT_NAME = 'credentials.questionKey';
const CUSTOM_QUESTION_INPUT_NAME = 'credentials.question';
const ANSWER_INPUT_NAME = 'credentials.answer';

export const transformSecurityQuestionEnroll: IdxStepTransformer = ({ transaction, formBag }) => {
  const { nextStep: { relatesTo, inputs } = {} as NextStep } = transaction;
  if (!relatesTo?.value) {
    return formBag;
  }

  const { contextualData } = relatesTo.value;
  const { uischema, data } = formBag;

  const customQuestionOptions = inputs?.[0]?.options?.filter(({ value }) => (value as Input[])?.some(({ name }) => name === 'question'));
  const predefinedQuestionOptions = inputs?.[0]?.options?.filter(({ value }) => !(value as Input[])?.some(({ name }) => name === 'question'));

  const predefinedAnswerInput = (predefinedQuestionOptions?.[0].value as Input[]).find(({ name }) => name === 'answer');
  const predefinedAnswerElement: FieldElement = {
    type: 'Control',
    label: predefinedAnswerInput?.label ?? predefinedAnswerInput?.name,
    name: ANSWER_INPUT_NAME,
    options: {
      inputMeta: {
        ...predefinedAnswerInput,
        name: ANSWER_INPUT_NAME,
        secret: true,
      },
    },
  };

  const customAnswerInput = (predefinedQuestionOptions?.[0].value as Input[]).find(({ name }) => name === 'answer');
  const customAnswerElement: FieldElement = {
    type: 'Control',
    label: customAnswerInput?.label ?? customAnswerInput?.name,
    name: ANSWER_INPUT_NAME,
    options: {
      inputMeta: {
        ...customAnswerInput,
        name: ANSWER_INPUT_NAME,
        secret: true,
      },
    },
  };

  const predefinedQuestions = contextualData?.questions?.map((question: Question) => ({
    value: question.questionKey,
    label: question.question,
  } as IdxOption));
  const predefinedQuestionsElement: FieldElement = {
    type: 'Control',
    name: QUESTION_KEY_INPUT_NAME,
    label: loc('oie.security.question.questionKey.label', 'login'),
    options: {
      format: 'dropdown',
      inputMeta: {
        ...(predefinedQuestionOptions?.[0].value as Input[]).find(({ name }) => name === 'questionKey'),
        name: QUESTION_KEY_INPUT_NAME,
      },
      customOptions: predefinedQuestions,
    },
  };

  // set default value predefinedQuestionsElement
  data[QUESTION_KEY_INPUT_NAME] = predefinedQuestions?.[0].value as string;

  const customQuestionElement: FieldElement = {
    type: 'Control',
    name: CUSTOM_QUESTION_INPUT_NAME,
    label: loc('oie.security.question.createQuestion.label', 'login'),
    options: {
      type: 'string',
      inputMeta: {
        ...(customQuestionOptions?.[0].value as Input[]).find(({ name }) => name === 'question'),
        name: CUSTOM_QUESTION_INPUT_NAME,
      },
    },
  };

  // Add the title to the top
  const titleElement: TitleElement = {
    type: 'Title',
    options: {
      content: loc('oie.security.question.enroll.title', 'login'),
    },
  };

  const questionTypeRadioEl: StepperRadioElement = {
    type: 'StepperRadio',
    options: {
      name: 'questionType',
      defaultOption: 'predefined',
      customOptions: [{
        value: 'predefined',
        label: loc('oie.security.question.questionKey.label', 'login'),
      }, {
        key: 'credentials.questionKey',
        value: 'custom',
        label: loc('oie.security.question.createQuestion.label', 'login'),
      }],
    },
  };

  const securityQuestionStepper: StepperLayout = {
    type: UISchemaLayoutType.STEPPER,
    elements: [
      // Predefined questions
      {
        type: UISchemaLayoutType.VERTICAL,
        elements: [
          titleElement,
          questionTypeRadioEl,
          predefinedQuestionsElement,
          predefinedAnswerElement,
          {
            type: 'Button',
            label: loc('mfa.challenge.verify', 'login'),
            scope: `#/properties/${ButtonType.SUBMIT}`,
            options: {
              type: ButtonType.SUBMIT,
              dataType: 'save',
            },
          } as ButtonElement,
        ],
      } as UISchemaLayout,
      // Custom question
      {
        type: UISchemaLayoutType.VERTICAL,
        elements: [
          titleElement,
          questionTypeRadioEl,
          customQuestionElement,
          customAnswerElement,
          {
            type: 'Button',
            label: loc('mfa.challenge.verify', 'login'),
            scope: `#/properties/${ButtonType.SUBMIT}`,
            options: {
              type: ButtonType.SUBMIT,
              actionParams: { [QUESTION_KEY_INPUT_NAME]: 'custom' },
              dataType: 'save',
            },
          } as ButtonElement,
        ],
      } as UISchemaLayout,
    ],
  };

  uischema.elements = [securityQuestionStepper];

  // TODO: support stepper dataSchema to pick validators based on selection
  // eslint-disable-next-line no-param-reassign
  formBag.dataSchema = {};

  return formBag;
};
