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
  IdxStepTransformer,
  PasswordSettings,
  TitleElement,
} from '../../types';
import { transformEnrollPasswordAuthenticator } from './transformEnrollPasswordAuthenticator';

const getContentTitleAndParams = (daysToExpiry: number): TitleElement['options'] => {
  if (daysToExpiry > 0) {
    return { content: 'password.expiring.title', contentParams: [`${daysToExpiry}`] };
  }

  if (daysToExpiry === 0) {
    return { content: 'password.expiring.today' };
  }

  return { content: 'password.expiring.soon' };
};

export const transformExpiredPasswordWarningAuthenticator: IdxStepTransformer = (
  transaction,
  formBag,
  widgetProps,
) => {
  const { brandName } = widgetProps;
  const { nextStep: { relatesTo }, availableSteps, messages } = transaction;
  const passwordSettings = (relatesTo?.value?.settings || {}) as PasswordSettings;
  const { daysToExpiry } = passwordSettings;

  const baseFormBag = transformEnrollPasswordAuthenticator(transaction, formBag, widgetProps);
  const { uischema } = baseFormBag;

  const titleElement: TitleElement = {
    type: 'Title',
    // daysToExpiry should be set when reaching here, in case it isnt, we use -1 to display 'soon'
    options: getContentTitleAndParams(daysToExpiry ?? -1),
  };

  // Replace default (enrollment) title with reset title
  uischema.elements.splice(0, 1, titleElement);
  if (brandName) {
    // add element after title in elements array
    uischema.elements.splice(1, 0, {
      type: 'Description',
      options: { content: 'password.expiring.subtitle.specific', contentParams: [brandName] },
    } as DescriptionElement);
  }

  if (!brandName && messages?.length) {
    // add element after title in elements array
    uischema.elements.splice(1, 0, {
      type: 'Description',
      options: { content: messages[0].i18n?.key },
    } as DescriptionElement);
  }

  const submitBtnElement: ButtonElement = {
    type: 'Button',
    label: 'password.expired.submit',
    scope: `#/properties/${ButtonType.SUBMIT}`,
    options: {
      type: ButtonType.SUBMIT,
    },
  };
  uischema.elements.push(submitBtnElement);

  const skipStep = availableSteps?.find(({ name }) => name === 'skip' );
  if (skipStep) {
    const { name: step } = skipStep;
    const skipBtnElement: ButtonElement = {
      type: 'Button',
      label: 'password.expiring.later',
      scope: '#/properties/skip',
      options: {
        type: ButtonType.BUTTON,
        variant: 'floating',
        wide: false,
        step,
      },
    };
    uischema.elements.push(skipBtnElement);
  }

  return baseFormBag;
};
