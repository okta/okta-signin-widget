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
    TitleElement,
  } from '../../types';
  import { loc } from '../../util';

  const getPasswordExpiryTitle = (daysToExpiry = -1): string => {
    if (daysToExpiry > 0) {
      return loc('password.expiring.title', 'login', [daysToExpiry]);
    } else if (daysToExpiry === 0) {
      return loc('password.expiring.today', 'login');
    } else {
      return loc('password.expiring.soon', 'login');
    }
  };
  
  export const transformReEnrollCustomPasswordExpiryWarning: IdxStepTransformer = ({
    transaction,
    formBag,
    widgetProps,
  }) => {
    const { uischema } = formBag;
    const { brandName } = widgetProps;
    const { nextStep: {
        relatesTo,
        // @ts-expect-error customExpiredPasswordName does not exist in NextStep type
        customExpiredPasswordName,
        // @ts-expect-error customExpiredPasswordURL does not exist in NextStep type
        customExpiredPasswordURL,
      } = {}
    } = transaction;
    const passwordPolicy = relatesTo?.value.settings;
    // @ts-expect-error OKTA-598704 - daysToExpiry does not exist in IdxAuthenticator.settings type
    const daysToExpiry = passwordPolicy?.daysToExpiry;

    const titleElement: TitleElement = {
      type: 'Title',
      options: {
        content: getPasswordExpiryTitle(daysToExpiry),
      },
    };

    const subtitle = brandName
      ? loc('password.expiring.subtitle.specific', 'login', [brandName])
      : loc('password.expiring.subtitle.generic', 'login');
    const subtitleElement: DescriptionElement = {
      type: 'Description',
      contentType: 'subtitle',
      options: {
        content: subtitle + ' ' + loc('password.expired.custom.subtitle', 'login'),
      },
    };
  
    const submitBtnElement: ButtonElement = {
      type: 'Button',
      label: loc('password.expired.custom.submit', 'login', [customExpiredPasswordName]),
      options: {
        type: ButtonType.BUTTON,
        step: transaction.nextStep!.name,
        onClick: () => {
          Util.redirect(customExpiredPasswordURL);
        },
      },
    };
  
    uischema.elements = [
      titleElement,
      subtitleElement,
      submitBtnElement,
    ];

    const skipStep = transaction.availableSteps?.find(({ name }) => name === 'skip');
    if(typeof skipStep !== 'undefined') {
      uischema.elements.push({
        type: 'Link',
        contentType: 'footer',
        options: {
          label: loc('password.expiring.later', 'login'),
          isActionStep: true,
          step: skipStep?.name,
        },
      } as LinkElement)
    }
  
    return formBag;
  };
  