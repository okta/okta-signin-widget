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

import {
  AccordionLayout,
  AuthenticatorButtonElement,
  AuthenticatorButtonListElement,
  UISchemaLayoutType,
} from '../../types';
import { loc } from '../../util';

// Keep in sync with isPhishingResistantMethod in src/v2/view-builder/utils/AuthenticatorUtil.js

type AuthenticatorMethodWithPhishingResistance = {
  type?: string;
  phishingResistantCapable?: boolean;
};

/**
 * Flags buttons whose method the backend marks as phishing resistant
 * (`phishingResistantCapable` on `authenticators[].methods[]`, joined to the option by authenticator id).
 * Relies only on the backend flag; `deviceKnown` is deliberately ignored (including for FastPass).
 * Returns the buttons untouched when the backend sent no flag at all.
 */
export const markPhishingResistantButtons = (
  buttons: AuthenticatorButtonElement[],
  authenticators?: IdxAuthenticator[],
): AuthenticatorButtonElement[] => {
  const hasAnyFlag = authenticators?.some((authenticator) => (
    (authenticator.methods as AuthenticatorMethodWithPhishingResistance[] | undefined)
      ?.some((method) => method.phishingResistantCapable === true)
  ));
  if (!hasAnyFlag) {
    return buttons;
  }

  return buttons.map((button) => {
    // Join on the option's form `id` (the authenticator id). `relatesTo.id` is an enrollment id for
    // most authenticators, which differs from `authenticators[].id`, so it is never used.
    const authenticatorId = button.options.actionParams?.['authenticator.id'];
    if (!authenticatorId) {
      return button;
    }
    const methodType = button.options.actionParams?.['authenticator.methodType'];
    const methods = (authenticators?.find(({ id }) => id === authenticatorId)?.methods
      ?? []) as AuthenticatorMethodWithPhishingResistance[];
    const isCapable = methodType
      ? methods.some((method) => (
        method.type === methodType && method.phishingResistantCapable === true
      ))
      : methods.some((method) => method.phishingResistantCapable === true);
    if (!isCapable) {
      return button;
    }
    return { ...button, options: { ...button.options, phishingResistant: true } };
  });
};

/**
 * Builds the verify list. When the list mixes phishing resistant and other methods, the phishing resistant
 * ones are listed first and the rest are collapsed under "More options". Otherwise a single flat list
 * is returned, exactly as before.
 */
export const getAuthenticatorVerifyListElements = (
  buttons: AuthenticatorButtonElement[],
): Array<AuthenticatorButtonListElement | AccordionLayout> => {
  const phishingResistant = buttons.filter(({ options }) => options.phishingResistant);
  const others = buttons.filter(({ options }) => !options.phishingResistant);
  if (!phishingResistant.length || !others.length) {
    return [{
      type: 'AuthenticatorButtonList',
      options: { buttons, dataSe: 'authenticator-verify-list' },
    }];
  }

  return [
    {
      type: 'AuthenticatorButtonList',
      options: { buttons: phishingResistant, dataSe: 'authenticator-verify-list' },
    },
    {
      type: UISchemaLayoutType.ACCORDION,
      elements: [{
        type: 'AccordionPanel',
        key: 'more-options',
        options: {
          id: 'more-options',
          styleVariant: 'more-options',
          summary: loc('oie.select.authenticators.verify.more.options', 'login'),
          content: {
            type: UISchemaLayoutType.VERTICAL,
            elements: [{
              type: 'AuthenticatorButtonList',
              options: { buttons: others, dataSe: 'authenticator-verify-more-options-list' },
            } as AuthenticatorButtonListElement],
          },
        },
      }],
    },
  ];
};
