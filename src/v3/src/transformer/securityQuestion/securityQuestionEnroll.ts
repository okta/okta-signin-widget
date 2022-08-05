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
import { loc } from '../../util';

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
  const { uischema, data, dataSchema } = formBag;

  const customQuestionOptions = inputs?.[0]?.options?.filter(({ value }) => (value as Input[])?.some(({ name }) => name === 'question'));
  const predefinedQuestionOptions = inputs?.[0]?.options?.filter(({ value }) => !(value as Input[])?.some(({ name }) => name === 'question'));

  const predefinedAnswerInput = (predefinedQuestionOptions?.[0].value as Input[]).find(({ name }) => name === 'answer');
  const predefinedAnswerElement: FieldElement = {
    type: 'Field',
    label: predefinedAnswerInput?.label ?? predefinedAnswerInput?.name,
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
    type: 'Field',
    label: customAnswerInput?.label ?? customAnswerInput?.name,
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
    type: 'Field',
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

  const predefinedSubmitButton: ButtonElement = {
    type: 'Button',
    label: loc('mfa.challenge.verify', 'login'),
    options: {
      type: ButtonType.SUBMIT,
      step: transaction.nextStep!.name,
    },
  };

  const customQuestionElement: FieldElement = {
    type: 'Field',
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
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        layout: () => securityQuestionStepper.elements[0],
      }, {
        key: 'credentials.questionKey',
        value: 'custom',
        label: loc('oie.security.question.createQuestion.label', 'login'),
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        layout: () => securityQuestionStepper.elements[1],
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
          predefinedSubmitButton,
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
            options: {
              type: ButtonType.SUBMIT,
              step: transaction.nextStep!.name,
              actionParams: { [QUESTION_KEY_INPUT_NAME]: 'custom' },
            },
          } as ButtonElement,
        ],
      } as UISchemaLayout,
    ],
  };

  uischema.elements = [securityQuestionStepper];

  // update default data
  data[QUESTION_KEY_INPUT_NAME] = predefinedQuestions?.[0].value as string;

  // update default dataSchema
  dataSchema.submit = predefinedSubmitButton.options;

  return formBag;
};
