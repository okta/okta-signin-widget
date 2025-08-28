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

import {
  ButtonElement,
  ButtonType,
  FieldElement,
  IdxStepTransformer,
  TitleElement,
  UISchemaElement,
} from '../../../types';
import { loc } from '../../../util';
import { getUIElementWithName } from '../../utils';
import Logger from '../../../../../util/Logger';

export const transformSecurityQuestionVerify: IdxStepTransformer = ({ transaction, formBag }) => {
  const { nextStep: { relatesTo, inputs } = {} as NextStep } = transaction;
  const { uischema } = formBag;

  const titleElement: TitleElement = {
    type: 'Title',
    options: {
      content: loc('oie.security.question.challenge.title', 'login'),
    },
  };

  const answerElement: FieldElement = getUIElementWithName(
    'credentials.answer',
    uischema.elements as UISchemaElement[],
  ) as FieldElement;
  let securityQuestionKey = relatesTo?.value?.profile?.questionKey;
  if (!securityQuestionKey) {
    Logger.warn('Security question key is missing from profile, getting from inputs');
    securityQuestionKey = (inputs?.[0].value as Input[]).find(({ name }) => name === 'questionKey')?.value;
  }
  answerElement.translations = [{
    name: 'label',
    i18nKey: '',
    value: securityQuestionKey === 'custom'
      ? relatesTo?.value?.profile?.question as string
      : loc(`security.${securityQuestionKey}`, 'login'),
  }];

  // TODO: this should be cleaned up once backend API was fixed.
  answerElement.options.inputMeta.secret = true;
  answerElement.noTranslate = true;

  const submitButton: ButtonElement = {
    type: 'Button',
    label: loc('oform.verify', 'login'),
    options: {
      type: ButtonType.SUBMIT,
      step: transaction.nextStep!.name,
    },
  };

  uischema.elements = [
    titleElement,
    answerElement,
    submitButton,
  ];

  return formBag;
};
