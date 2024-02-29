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

import { IdxTransaction } from '@okta/okta-auth-js';

import { traverseLayout } from '../transformer/util';
import {
  DescriptionElement,
  FormBag,
  InfoboxElement,
  TitleElement,
  UISchemaLayout,
  WidgetMessage,
  WidgetProps,
} from '../types';
import { getApplicationName, isConsentStep } from './idxUtils';
import { getPageTitle } from './settingsUtils';

export const extractFirstWidgetMessageStr = (
  widgetMessage?: WidgetMessage | WidgetMessage[],
): string | null => {
  if (Array.isArray(widgetMessage)) {
    const [message] = widgetMessage;
    return extractFirstWidgetMessageStr(message);
  }

  if (typeof widgetMessage?.message === 'string') {
    return widgetMessage.message;
  }

  if (typeof widgetMessage !== 'undefined' && Array.isArray(widgetMessage.message)) {
    return extractFirstWidgetMessageStr(widgetMessage.message);
  }
  return null;
};

export const extractPageTitle = (
  uischema: FormBag['uischema'],
  widgetProps: WidgetProps,
  idxTransaction?: IdxTransaction,
): string | null => {
  // Consent remediations should set title to the Application name
  if (isConsentStep(idxTransaction)) {
    return getApplicationName(idxTransaction);
  }

  let headerTitleContent: string | null = null;
  // Title Header
  traverseLayout({
    layout: uischema,
    predicate: (element) => element.type === 'Title',
    callback: (element) => {
      if (headerTitleContent === null) {
        headerTitleContent = (element as TitleElement).options.content;
      }
    },
  });

  // Error Info Boxes
  traverseLayout({
    layout: uischema,
    predicate: (element) => element.type === 'InfoBox',
    callback: (element) => {
      if (headerTitleContent !== null) {
        return;
      }
      const widgetMessage = (element as InfoboxElement).options.message;
      const message = Array.isArray(widgetMessage) ? widgetMessage[0] : widgetMessage;
      headerTitleContent = typeof message.title === 'undefined'
        ? extractFirstWidgetMessageStr(message)
        : message.title;
    },
  });

  // Description text only (terminal pages)
  traverseLayout({
    layout: uischema,
    predicate: (element) => element.type === 'Description',
    callback: (element) => {
      if (headerTitleContent === null) {
        headerTitleContent = (element as DescriptionElement).options.content;
      }
    },
  });

  return getPageTitle(widgetProps, headerTitleContent, idxTransaction);
};
