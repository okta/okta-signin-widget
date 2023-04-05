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

import { AppIcon, DeviceIcon } from '../../../components/Images';
import {
  ButtonElement,
  ButtonType,
  IdxStepTransformer,
  ImageWithTextElement,
  TitleElement,
} from '../../../types';
import { loc } from '../../../util';

export const transformEmailChallengeConsent: IdxStepTransformer = ({ transaction, formBag }) => {
  const { uischema } = formBag;
  const {
    nextStep: {
      // @ts-expect-error requestInfo missing from NextStep interface
      requestInfo,
      name: step,
    } = {},
  } = transaction;

  // @ts-expect-error OKTA-489560 (missing requestInfo prop)
  const appName = requestInfo?.find((info) => info?.name === 'appName');
  const appImageElement: ImageWithTextElement = {
    type: 'ImageWithText',
    noTranslate: true,
    options: {
      id: appName?.name,
      SVGIcon: AppIcon,
      textContent: appName?.value,
    },
  };
  // @ts-expect-error OKTA-489560 (missing requestInfo prop)
  const browser = requestInfo?.find((info) => info?.name === 'browser');
  const browserImageElement: ImageWithTextElement = {
    type: 'ImageWithText',
    noTranslate: true,
    options: {
      id: browser?.name,
      SVGIcon: DeviceIcon,
      textContent: browser?.value,
    },
  };

  const titleElement: TitleElement = {
    type: 'Title',
    options: {
      content: loc('oie.consent.enduser.title', 'login'),
    },
  };

  const deny: ButtonElement = {
    type: 'Button',
    label: loc('oie.consent.enduser.deny.label', 'login'),
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
    options: {
      type: ButtonType.BUTTON,
      variant: 'primary',
      dataType: 'save',
      actionParams: { consent: true },
      step: step!,
    },
  };

  uischema.elements = [
    titleElement,
    ...(browser && [browserImageElement]),
    ...(appName && [appImageElement]),
    deny,
    allow,
  ];

  return formBag;
};
