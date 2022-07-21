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

import { IdxActionParams } from '@okta/okta-auth-js';
import { loc } from 'okta';
import { getMessage } from '../../../../v2/ion/i18nTransformer';
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
    return { content: loc('password.expiring.title', 'login', [`${daysToExpiry}`]) };
  }

  if (daysToExpiry === 0) {
    return { content: loc('password.expiring.today', 'login') };
  }

  return { content: loc('password.expiring.soon', 'login') };
};

export const transformExpiredPasswordWarningAuthenticator: IdxStepTransformer = ({
  transaction,
  formBag,
  widgetProps,
}) => {
  const { brandName, authClient } = widgetProps;
  const { nextStep: { relatesTo } = {}, availableSteps, messages } = transaction;
  const passwordSettings = (relatesTo?.value?.settings || {}) as PasswordSettings;
  const { daysToExpiry } = passwordSettings;

  const baseFormBag = transformEnrollPasswordAuthenticator({ transaction, formBag, widgetProps });
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
      options: { content: loc('password.expiring.subtitle.specific', 'login', [brandName]) },
    } as DescriptionElement);
  }

  if (!brandName && messages?.length) {
    // add element after title in elements array
    uischema.elements.splice(1, 0, {
      type: 'Description',
      options: { content: getMessage(messages[0]) },
    } as DescriptionElement);
  }

  const submitBtnElement: ButtonElement = {
    type: 'Button',
    label: loc('password.expired.submit', 'login'),
    scope: `#/properties/${ButtonType.SUBMIT}`,
    options: {
      type: ButtonType.SUBMIT,
    },
  };
  uischema.elements.push(submitBtnElement);

  const skipStep = availableSteps?.find(({ name }) => name === 'skip' );
  if (skipStep) {
    const { name } = skipStep;
    const skipBtnElement: ButtonElement = {
      type: 'Button',
      label: loc('password.expiring.later', 'login'),
      scope: '#/properties/skip',
      options: {
        type: ButtonType.BUTTON,
        variant: 'floating',
        wide: false,
        // @ts-ignore OKTA-512706 temporary until auth-js applies this fix
        action: (params?: IdxActionParams) => {
          const { stateHandle, ...rest } = params ?? {};
          return authClient?.idx.proceed({
            // @ts-ignore stateHandle can be undefined
            stateHandle,
            actions: [{ name, params: rest }],
          });
        },
      },
    };
    uischema.elements.push(skipBtnElement);
  }

  return baseFormBag;
};
