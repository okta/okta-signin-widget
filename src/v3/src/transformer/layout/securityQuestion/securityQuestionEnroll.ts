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
} from '../../../types';
import { loc, removeFieldLevelMessages } from '../../../util';
import { getUIElementWithName } from '../../utils';

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

  const predefinedQuestionOptions = inputs?.[0]?.options?.filter(({ value }) => !(value as Input[])?.some(({ name }) => name === 'question'));

  const predefinedAnswerElement = getUIElementWithName(
    ANSWER_INPUT_NAME,
    uischema.elements,
  ) as FieldElement;
  predefinedAnswerElement.options.inputMeta.secret = true;

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

  const preSelectedQuestion = predefinedQuestions?.[0].value as string;

  const predefinedSubmitButton: ButtonElement = {
    type: 'Button',
    label: loc('mfa.challenge.verify', 'login'),
    options: {
      type: ButtonType.SUBMIT,
      step: transaction.nextStep!.name,
      includeImmutableData: false,
    },
  };

  const customQuestionSubmitButton: ButtonElement = {
    type: 'Button',
    label: loc('mfa.challenge.verify', 'login'),
    options: {
      type: ButtonType.SUBMIT,
      step: transaction.nextStep!.name,
      actionParams: { [QUESTION_KEY_INPUT_NAME]: 'custom' },
    },
  };

  const customQuestionElement: FieldElement = getUIElementWithName(
    CUSTOM_QUESTION_INPUT_NAME,
    uischema.elements,
  ) as FieldElement;
  customQuestionElement.label = loc('oie.security.question.createQuestion.label', 'login');

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
        callback: (widgetContext, stepIndex) => {
          const { dataSchemaRef, setData } = widgetContext;
          dataSchemaRef.current!.submit = predefinedSubmitButton.options;
          dataSchemaRef.current!.fieldsToValidate = ['credentials.answer'];

          // reset default selected question
          setData((prev) => ({
            ...prev,
            [QUESTION_KEY_INPUT_NAME]: preSelectedQuestion,
          }));

          // eslint-disable-next-line @typescript-eslint/no-use-before-define
          const stepLayout = securityQuestionStepper.elements[stepIndex];
          stepLayout.elements = removeFieldLevelMessages(stepLayout.elements);
        },
      }, {
        key: 'credentials.questionKey',
        value: 'custom',
        label: loc('oie.security.question.createQuestion.label', 'login'),
        callback: (widgetContext, stepIndex) => {
          const { dataSchemaRef } = widgetContext;
          dataSchemaRef.current!.submit = customQuestionSubmitButton.options;
          dataSchemaRef.current!.fieldsToValidate = ['credentials.question', 'credentials.answer'];

          // eslint-disable-next-line @typescript-eslint/no-use-before-define
          const stepLayout = securityQuestionStepper.elements[stepIndex];
          stepLayout.elements = removeFieldLevelMessages(stepLayout.elements);
        },
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
          customQuestionSubmitButton,
        ],
      } as UISchemaLayout,
    ],
  };

  uischema.elements = [securityQuestionStepper];

  // update default data
  data[QUESTION_KEY_INPUT_NAME] = preSelectedQuestion;

  // update default dataSchema
  dataSchema.submit = predefinedSubmitButton.options;
  dataSchema.fieldsToValidate = ['credentials.answer'];

  return formBag;
};
