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

import Util from '../../../../util/Util';
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

export const transformExpiredCustomPasswordWarning: IdxStepTransformer = ({
  transaction,
  formBag,
  widgetProps,
}) => {
  const { uischema } = formBag;
  const {
    nextStep: {
      relatesTo,
      // @ts-expect-error customExpiredPasswordName does not exist in NextStep type
      customExpiredPasswordName,
      // @ts-expect-error customExpiredPasswordURL does not exist in NextStep type
      customExpiredPasswordURL,
    } = {},
  } = transaction;
  const passwordSettings = (relatesTo?.value?.settings || {}) as PasswordSettings;
  const { daysToExpiry } = passwordSettings;

  const titleElement: TitleElement = {
    type: 'Title',
    options: getPasswordExpiryContentTitleAndParams(daysToExpiry),
  };

  const { brandName } = widgetProps;
  const subtitleElement: DescriptionElement = {
    type: 'Description',
    contentType: 'subtitle',
    options: {
      content: brandName
        ? loc('password.expiring.soon.subtitle.specific', 'login', [brandName])
        : loc('password.expiring.soon.subtitle.generic', 'login'),
    },
  };

  const submitBtnElement: ButtonElement = {
    type: 'Button',
    label: loc('password.expired.custom.submit', 'login', [customExpiredPasswordName]),
    options: {
      type: ButtonType.BUTTON,
      step: transaction.nextStep!.name,
      onClick: () => Util.redirect(customExpiredPasswordURL),
    },
  };

  uischema.elements = [
    titleElement,
    subtitleElement,
    submitBtnElement,
  ];

  const skipStep = transaction.availableSteps?.find(({ name }) => name === 'skip');
  if (typeof skipStep !== 'undefined') {
    uischema.elements.push({
      type: 'Link',
      contentType: 'footer',
      options: {
        label: loc('password.expiring.later', 'login'),
        isActionStep: false,
        step: skipStep.name,
      },
    } as LinkElement);
  }

  return formBag;
};
