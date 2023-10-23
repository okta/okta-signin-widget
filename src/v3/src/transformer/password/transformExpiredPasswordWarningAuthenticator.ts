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

import { getMessage } from '../../../../v2/ion/i18nUtils';
import {
  ButtonElement,
  ButtonType,
  DescriptionElement,
  IdxStepTransformer,
  LinkElement,
  PasswordSettings,
  TitleElement,
} from '../../types';
import { getPasswordExpiryContentTitleAndParams, loc } from '../../util';
import { transformEnrollPasswordAuthenticator } from './transformEnrollPasswordAuthenticator';

export const transformExpiredPasswordWarningAuthenticator: IdxStepTransformer = ({
  transaction,
  formBag,
  widgetProps,
}) => {
  const { brandName } = widgetProps;
  const { nextStep: { relatesTo } = {}, availableSteps, messages } = transaction;
  const passwordSettings = (relatesTo?.value?.settings || {}) as PasswordSettings;
  const { daysToExpiry } = passwordSettings;

  const baseFormBag = transformEnrollPasswordAuthenticator({ transaction, formBag, widgetProps });
  const { uischema } = baseFormBag;

  const titleElement: TitleElement = {
    type: 'Title',
    options: getPasswordExpiryContentTitleAndParams(daysToExpiry),
  };

  // Replace default (enrollment) title with reset title
  uischema.elements.splice(0, 1, titleElement);
  if (brandName) {
    // add element after title in elements array
    uischema.elements.splice(1, 0, {
      type: 'Description',
      contentType: 'subtitle',
      options: { content: loc('password.expiring.subtitle.specific', 'login', [brandName]) },
    } as DescriptionElement);
  }

  if (!brandName && messages?.length) {
    // add element after title in elements array
    uischema.elements.splice(1, 0, {
      type: 'Description',
      contentType: 'subtitle',
      // @ts-ignore Message interface defined in v2/i18nTransformer JsDoc is incorrect
      options: { content: getMessage(messages[0]) },
    } as DescriptionElement);
  }

  const submitBtnElement: ButtonElement = {
    type: 'Button',
    label: loc('password.expired.submit', 'login'),
    options: {
      type: ButtonType.SUBMIT,
      step: transaction.nextStep!.name,
    },
  };
  uischema.elements.push(submitBtnElement);

  const skipStep = availableSteps?.find(({ name }) => name === 'skip' );
  if (skipStep) {
    const { name: step } = skipStep;
    const skipLinkEle: LinkElement = {
      type: 'Link',
      options: {
        label: loc('password.expiring.later', 'login'),
        step,
        isActionStep: false,
      },
    };
    uischema.elements.push(skipLinkEle);
  }

  return baseFormBag;
};
