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

import { ControlElement } from '@jsonforms/core';

import AppSvg from '../../img/Icon_T1_100x100_Apps.svg';
import BrowserSvg from '../../img/Icon_T1_100x100_Device-Desktop.svg';
import {
  IdxStepTransformer,
  ImageWithTextElement,
  TitleElement,
} from '../../types';
import { ButtonOptionType } from '../getButtonControls';
import { removeUIElementWithScope } from '../utils';

export const transformEmailChallengeConsent: IdxStepTransformer = (transaction, formBag) => {
  const { schema, uischema } = formBag;
  schema.properties = schema.properties ?? {};
  schema.required = schema.required ?? [];

  // removing consent field as it is controlled by buttons
  uischema.elements = removeUIElementWithScope(
    '#/properties/consent',
    uischema.elements as ControlElement[],
  );
  // removing consent from schema
  delete schema.properties.consent;
  schema.required = schema.required.filter((item) => item !== 'consent');

  const [remediation] = transaction.neededToProceed;
  // @ts-ignore OKTA-489560 (missing requestInfo prop)
  const appName = remediation.requestInfo?.find((info) => info?.name === 'appName');
  // @ts-ignore OKTA-489560 (missing requestInfo prop)
  const browser = remediation.requestInfo?.find((info) => info?.name === 'browser');

  if (appName?.value) {
    const appImageElement: ImageWithTextElement = {
      type: 'Control',
      scope: `#/properties/${appName.name}`,
      options: {
        format: 'ImageWithText',
        SVGIcon: AppSvg,
        textContent: appName.value,
      },
    };
    uischema.elements.unshift(appImageElement);
  }

  if (browser?.value) {
    const browserImageElement: ImageWithTextElement = {
      type: 'Control',
      scope: `#/properties/${browser.name}`,
      options: {
        format: 'ImageWithText',
        SVGIcon: BrowserSvg,
        textContent: browser.value,
      },
    };
    uischema.elements.unshift(browserImageElement);
  }

  const titleElement: TitleElement = {
    type: 'Title',
    options: {
      content: 'oie.consent.enduser.title',
    },
  };
  uischema.elements.unshift(titleElement);

  const deny: ControlElement = {
    type: 'Control',
    label: 'oie.consent.enduser.deny.label',
    scope: '#/properties/deny',
    options: {
      format: 'button',
      type: ButtonOptionType.SUBMIT,
      variant: 'secondary',
      idxMethod: 'proceed',
      idxMethodParams: { consent: false },
    },
  };

  const allow: ControlElement = {
    type: 'Control',
    label: 'oie.consent.enduser.accept.label',
    scope: '#/properties/allow',
    options: {
      format: 'button',
      type: ButtonOptionType.SUBMIT,
      variant: 'secondary',
      idxMethod: 'proceed',
      idxMethodParams: { consent: true },
    },
  };

  uischema.elements.push(deny);
  uischema.elements.push(allow);

  return formBag;
};
