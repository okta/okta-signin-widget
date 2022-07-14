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

import {
  ButtonElement,
  ButtonType,
  IdxStepTransformer,
  TitleElement,
  UISchemaElement,
} from '../../types';
import { getUIElementWithName } from '../utils';

export const transformSecurityQuestionVerify: IdxStepTransformer = (transaction, formBag) => {
  const { nextStep: { relatesTo } } = transaction;
  const { uischema } = formBag;

  const answerElement = getUIElementWithName(
    'credentials.answer',
    uischema.elements as UISchemaElement[],
  );
  if (answerElement) {
    answerElement.label = relatesTo?.value?.profile?.question as string;
  }

  // Add the title to the top
  const titleElement: TitleElement = {
    type: 'Title',
    options: {
      content: 'oie.security.question.challenge.title',
    },
  };
  uischema.elements.unshift(titleElement);

  const primaryButton: ButtonElement = {
    type: 'Button',
    label: 'oform.verify',
    scope: `#/properties/${ButtonType.SUBMIT}`,
    options: {
      type: ButtonType.SUBMIT,
    },
  };
  uischema.elements.push(primaryButton);

  return formBag;
};
