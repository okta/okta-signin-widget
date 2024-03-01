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
  AppIcon,
  DeviceIcon,
  LocationIcon,
} from '../../components/Images';
import { CHALLENGE_INTENT_TO_I18KEY } from '../../constants';
import {
  DescriptionElement,
  HeadingElement,
  ImageWithTextElement,
  TerminalKeyTransformer,
  UISchemaElement,
} from '../../types';
import { loc } from '../../util';

type ExcludesFalse = <T>(x: T | false) => x is T;

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
    noTranslate: true,
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

  const challengeIntentSubtitleContent: string | undefined = CHALLENGE_INTENT_TO_I18KEY[intent]
    && loc(CHALLENGE_INTENT_TO_I18KEY[intent], 'login');
  const codeEntryInstructionElement: DescriptionElement = {
    type: 'Description',
    contentType: 'subtitle',
    options: {
      content: challengeIntentSubtitleContent || loc('idx.enter.otp.in.original.tab', 'login'),
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
        SVGIcon: AppIcon,
        textContent: loc('idx.return.link.otponly.app', 'login', [app.value.label]),
      },
    };
  }

  const clientOs = client?.value?.os;
  const clientBrowser = client?.value?.browser;
  if (clientBrowser && clientOs) {
    browserImageElement = {
      type: 'ImageWithText',
      options: {
        id: 'browser',
        SVGIcon: DeviceIcon,
        textContent: loc(
          'idx.return.link.otponly.browser.on.os',
          'login',
          [clientBrowser, clientOs],
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
        SVGIcon: LocationIcon,
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
