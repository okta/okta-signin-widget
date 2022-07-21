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

import { IdxAuthenticator } from '@okta/okta-auth-js';
import set from 'lodash/set';
import { loc } from 'okta';
import {
  DescriptionElement,
  ListElement,
  QRCodeElement,
  StepperNavButtonConfigAttrs,
  StepperNavButtonConfigDirection,
  UISchemaElement,
} from 'src/types';

export const appendDescriptionElements = (
  elements: UISchemaElement[],
  authenticator?: IdxAuthenticator,
): void => {
  if (!authenticator?.contextualData) {
    return;
  }

  const { contextualData } = authenticator;

  if (contextualData.qrcode) {
    const { href } = contextualData.qrcode;
    const { displayName } = authenticator;
    elements.push({
      type: 'List',
      options: {
        items: [
          loc('oie.enroll.okta_verify.qrcode.step1', 'login'),
          loc('oie.enroll.okta_verify.qrcode.step2', 'login'),
          loc('oie.enroll.okta_verify.qrcode.step3', 'login'),
        ],
        type: 'ordered',
      },
    } as ListElement);

    elements.push({
      type: 'QRCode',
      options: {
        label: displayName,
        data: href,
      },
    } as QRCodeElement);
    return;
  }

  // @ts-ignore OKTA-496373 - missing props from interface
  const { email } = contextualData;
  if (email) {
    elements.push({
      type: 'Description',
      options: {
        // TODO: revist this to use oie i18n string (EnrollChannelPollDescriptionView.js)
        content: loc('next.enroll.okta_verify.email.info', 'login', [email]),
      },
    } as DescriptionElement);
    return;
  }

  // @ts-ignore OKTA-496373 - missing props from interface
  const { phoneNumber } = contextualData;
  if (phoneNumber) {
    elements.push({
      type: 'Description',
      options: {
        // TODO: revist this to use oie i18n string (EnrollChannelPollDescriptionView.js)
        content: loc('next.enroll.okta_verify.sms.info', 'login', [phoneNumber]),
      },
    } as DescriptionElement);
  }
};

export const createNavButtonConfig = (hasQrCode: boolean): {
  navButtonsConfig: Record<StepperNavButtonConfigDirection, StepperNavButtonConfigAttrs>,
} => {
  const stepperNavBtnConfig = {
    navButtonsConfig: {
      next: {
        variant: 'secondary',
        label: hasQrCode
          ? 'enroll.totp.cannotScan'
          : 'next.enroll.okta_verify.switch.channel.link.text',
      },
    } as Record<StepperNavButtonConfigDirection, StepperNavButtonConfigAttrs>,
  };

  if (hasQrCode) {
    set(stepperNavBtnConfig, 'navButtonsConfig.prev', {
      variant: 'secondary',
      label: 'next.enroll.okta_verify.switch.channel.link.text',
    } as StepperNavButtonConfigAttrs);
  }

  return stepperNavBtnConfig;
};

export const getTitleKey = (selectedChannel?: string): string => {
  switch (selectedChannel) {
    case 'email':
      return 'oie.enroll.okta_verify.setup.email.title';
    case 'sms':
      return 'oie.enroll.okta_verify.setup.sms.title';
    default:
      return 'oie.enroll.okta_verify.setup.title';
  }
};
