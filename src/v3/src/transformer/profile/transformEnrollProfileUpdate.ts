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
  DescriptionElement,
  FieldElement,
  IdxStepTransformer,
  LinkElement,
  TitleElement,
  UISchemaElement,
} from '../../types';
import { loc } from '../../util';
import { getUIElementWithName } from '../utils';

const SECOND_EMAIL_FIELD_NAME = 'userProfile.secondEmail';

export const transformEnrollProfileUpdate: IdxStepTransformer = ({ transaction, formBag }) => {
  const { availableSteps, nextStep } = transaction;
  const { uischema, data } = formBag;

  const secondEmailField = getUIElementWithName(
    SECOND_EMAIL_FIELD_NAME,
    uischema.elements as UISchemaElement[],
  );
  if (typeof secondEmailField !== 'undefined') {
    /**
     * As per requirement of this flow set secondEmail default to empty string,
     * if exists in remediation ideally server should have passed default string in remediation
     */
    data[SECOND_EMAIL_FIELD_NAME] = '';
  }

  const hasAllOptionalFields = uischema.elements
    .filter((ele) => ele.type === 'Field')
    .every((element) => (element as FieldElement).options.inputMeta.required === false);

  const titleElement: TitleElement = {
    type: 'Title',
    options: { content: loc('oie.profile.additional.title', 'login') },
  };

  const subtitleElement: DescriptionElement = {
    type: 'Description',
    contentType: 'subtitle',
    options: { content: loc('oie.form.field.optional.description', 'login') },
  };

  const submitBtnElement: ButtonElement = {
    type: 'Button',
    label: loc('enroll.choices.submit.finish', 'login'),
    options: {
      type: ButtonType.SUBMIT,
      step: nextStep!.name,
    },
  };

  uischema.elements.unshift(subtitleElement);
  uischema.elements.unshift(titleElement);
  uischema.elements.push(submitBtnElement);

  const skipStep = availableSteps?.find(({ name }) => name === 'skip' );
  if (skipStep && hasAllOptionalFields) {
    const { name: step } = skipStep;
    const skipLinkEle: LinkElement = {
      type: 'Link',
      options: {
        label: loc('oie.enroll.skip.profile', 'login'),
        step,
        isActionStep: false,
      },
    };
    uischema.elements.push(skipLinkEle);
  }

  return formBag;
};
