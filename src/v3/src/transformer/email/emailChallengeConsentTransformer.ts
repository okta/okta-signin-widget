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

import AppSvg from '../../img/16pxApp.svg';
import BrowserSvg from '../../img/16pxDevice.svg';
import {
  ButtonElement,
  ButtonType,
  IdxStepTransformer,
  ImageWithTextElement,
  TitleElement,
  UISchemaElement,
} from '../../types';
import { loc } from '../../util';
import { removeUIElementWithName } from '../utils';

export const transformEmailChallengeConsent: IdxStepTransformer = ({ transaction, formBag }) => {
  const { uischema } = formBag;
  const {
    nextStep: {
      // @ts-ignore requestInfo missing from NextStep interface
      requestInfo,
      name: step,
    } = {},
  } = transaction;

  // removing consent field as it is controlled by buttons
  uischema.elements = removeUIElementWithName(
    'consent',
    uischema.elements as UISchemaElement[],
  );

  // @ts-ignore OKTA-489560 (missing requestInfo prop)
  const appName = requestInfo?.find((info) => info?.name === 'appName');
  // @ts-ignore OKTA-489560 (missing requestInfo prop)
  const browser = requestInfo?.find((info) => info?.name === 'browser');

  if (appName?.value) {
    const appImageElement: ImageWithTextElement = {
      type: 'ImageWithText',
      options: {
        id: appName.name,
        SVGIcon: AppSvg,
        textContent: appName.value,
      },
    };
    uischema.elements.unshift(appImageElement);
  }

  if (browser?.value) {
    const browserImageElement: ImageWithTextElement = {
      type: 'ImageWithText',
      options: {
        id: browser.name,
        SVGIcon: BrowserSvg,
        textContent: browser.value,
      },
    };
    uischema.elements.unshift(browserImageElement);
  }

  const titleElement: TitleElement = {
    type: 'Title',
    options: {
      content: loc('oie.consent.enduser.title', 'login'),
    },
  };
  uischema.elements.unshift(titleElement);

  const deny: ButtonElement = {
    type: 'Button',
    label: loc('oie.consent.enduser.deny.label', 'login'),
    scope: '#/properties/deny',
    options: {
      type: ButtonType.BUTTON,
      variant: 'secondary',
      actionParams: { consent: false },
      dataType: 'cancel',
      step: step!,
    },
  };

  const allow: ButtonElement = {
    type: 'Button',
    label: loc('oie.consent.enduser.accept.label', 'login'),
    scope: '#/properties/allow',
    options: {
      type: ButtonType.BUTTON,
      variant: 'secondary',
      dataType: 'save',
      actionParams: { consent: true },
      step: step!,
    },
  };

  uischema.elements.push(deny);
  uischema.elements.push(allow);

  return formBag;
};
