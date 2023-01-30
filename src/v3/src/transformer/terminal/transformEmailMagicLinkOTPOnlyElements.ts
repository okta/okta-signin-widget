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

import { CHALLENGE_INTENT_TO_I18KEY } from '../../constants';
import AppSvg from '../../img/16pxApp.svg';
import BrowserSvg from '../../img/16pxDevice.svg';
import LocationSvg from '../../img/16pxLocation.svg';
import {
  DescriptionElement,
  ExcludesFalse,
  HeadingElement,
  ImageWithTextElement,
  TerminalKeyTransformer,
  UISchemaElement,
} from '../../types';
import { loc } from '../../util';

export const transformEmailMagicLinkOTPOnly: TerminalKeyTransformer = (transaction, formBag) => {
  const { uischema } = formBag;
  const {
    context: {
      app,
      // @ts-expect-error TODO: OKTA-504300 'client' does not exist on IdxContext interface
      client,
      currentAuthenticator,
      intent,
    },
  } = transaction;

  const otpElement: HeadingElement = {
    type: 'Heading',
    options: {
      // @ts-expect-error TODO: OKTA-504299 otp missing from contextualData interface
      content: currentAuthenticator?.value?.contextualData?.otp,
      level: 3,
      visualLevel: 3,
      dataSe: 'otp-value',
    },
  };
  const warningTextElement: DescriptionElement = {
    type: 'Description',
    contentType: 'subtitle',
    options: {
      content: loc('idx.return.link.otponly.warning.text', 'login'),
      dataSe: 'otp-warning',
    },
  };

  const challengeIntent: string | undefined = CHALLENGE_INTENT_TO_I18KEY[intent]
    && loc(CHALLENGE_INTENT_TO_I18KEY[intent], 'login');
  const codeEntryInstructionElement: DescriptionElement = {
    type: 'Description',
    contentType: 'subtitle',
    options: {
      content: challengeIntent
        ? loc('idx.return.link.otponly.enter.code.on.page', 'login', [challengeIntent])
        : loc('idx.enter.otp.in.original.tab', 'login'),
      dataSe: 'enter-code-instr',
    },
  };

  let requestInfoTextElement: DescriptionElement | undefined;
  let appImageElement: ImageWithTextElement | undefined;
  let browserImageElement: ImageWithTextElement | undefined;
  let locationImageElement: ImageWithTextElement | undefined;
  if (app?.value?.label) {
    appImageElement = {
      type: 'ImageWithText',
      options: {
        id: 'app',
        SVGIcon: AppSvg,
        textContent: loc('idx.return.link.otponly.app', 'login', [app.value.label]),
      },
    };
  }

  if (client?.value?.browser && client?.value?.os) {
    browserImageElement = {
      type: 'ImageWithText',
      options: {
        id: 'browser',
        SVGIcon: BrowserSvg,
        textContent: loc(
          'idx.return.link.otponly.browser.on.os',
          'login',
          [client.value.browser, client.value.os],
        ),
      },
    };
  }

  if (client?.value?.location && (client.value.location.city || client.value.location.country)) {
    const { location: { city, state, country } } = client.value;
    const contentParams = state ? [city, state, country] : [city, country];
    locationImageElement = {
      type: 'ImageWithText',
      options: {
        id: 'location',
        SVGIcon: LocationSvg,
        textContent: state
          ? loc('geolocation.formatting.all', 'login', contentParams)
          : loc('geolocation.formatting.partial', 'login', contentParams),
      },
    };
  }

  if (appImageElement || browserImageElement || locationImageElement) {
    requestInfoTextElement = {
      type: 'Description',
      contentType: 'subtitle',
      noMargin: true,
      options: {
        content: loc('idx.return.link.otponly.request', 'login'),
        dataSe: 'otp-only-request-info',
      },
    };
  }

  const elements: UISchemaElement[] = [
    codeEntryInstructionElement,
    otpElement,
    requestInfoTextElement,
    browserImageElement,
    appImageElement,
    locationImageElement,
    warningTextElement,
  ]
    .map((x) => x !== undefined && x)
    .filter(Boolean as unknown as ExcludesFalse);
  uischema.elements.push(...elements);

  return formBag;
};
