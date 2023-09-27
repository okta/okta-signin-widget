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
  TitleElement,
} from '../../../types';
import { loc } from '../../../util';
import { getUIElementWithName } from '../../utils';

const TARGET_FIELD_NAME = 'authenticator.methodType';

export const transformEmailVerification: IdxStepTransformer = ({ transaction, formBag }) => {
  const { nextStep: { relatesTo } = {} } = transaction;
  const { uischema } = formBag;

  // Find methodType option, to use in btn params later
  const methodTypeElement = getUIElementWithName(
    TARGET_FIELD_NAME,
    uischema.elements,
  ) as FieldElement;

  const titleElement: TitleElement = {
    type: 'Title',
    options: {
      content: loc('oie.email.challenge.mfa.title', 'login'),
    },
  };

  const redactedEmailAddress = relatesTo?.value?.profile?.email as string;
  const redactedSecondaryEmailAddress = relatesTo?.value?.profile?.secondaryEmail as string;
  const getSubtitle = (): string => {
    if (redactedEmailAddress && redactedSecondaryEmailAddress) {
      return loc(
        'oie.email.verify.subtitle.text.with.email.and.secondary.email',
        'login',
        [redactedEmailAddress, redactedSecondaryEmailAddress],
        {
          $1: { element: 'span', attributes: { class: 'strong no-translate' } },
          $2: { element: 'span', attributes: { class: 'strong no-translate' } },
        },
      );
    }

    if (redactedEmailAddress) {
      return loc(
        'oie.email.verify.subtitle.text.with.email',
        'login',
        [redactedEmailAddress],
        { $1: { element: 'span', attributes: { class: 'strong no-translate' } } },
      );
    }

    return loc('oie.email.verify.subtitle.text.without.email', 'login');
  };

  const informationalText: DescriptionElement = {
    type: 'Description',
    contentType: 'subtitle',
    options: {
      content: getSubtitle(),
    },
  };

  const submitButtonControl: ButtonElement = {
    type: 'Button',
    label: loc('oie.email.verify.primaryButton', 'login'),
    options: {
      type: ButtonType.SUBMIT,
      step: transaction.nextStep!.name,
      actionParams: {
        'authenticator.methodType': methodTypeElement.options.inputMeta.options?.[0].value as string,
      },
    },
  };

  uischema.elements = [
    titleElement,
    informationalText,
    submitButtonControl,
  ];

  return formBag;
};
