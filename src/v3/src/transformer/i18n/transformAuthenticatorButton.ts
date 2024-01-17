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
  getI18nKey,
  getI18NParams,
} from '../../../../v2/ion/i18nUtils';
import { AUTHENTICATOR_KEY } from '../../constants';
import {
  AuthenticatorButtonElement,
  AuthenticatorButtonListElement,
  TransformStepFnWithOptions,
} from '../../types';
import { traverseLayout } from '../util';
import { addTranslation } from './util';

const getAuthenticatorButtonKey = (
  stepName: string,
  options: AuthenticatorButtonElement['options'],
): string => {
  // try get i18nKey without methodType
  const i18nKey = getI18nKey(`${stepName}.authenticator.${options.key}`);
  if (i18nKey) {
    return i18nKey;
  }

  const methodType = options.authenticator?.methods?.[0]?.type
    || options.actionParams?.['authenticator.methodType'];
  // try get i18nKey with methodType
  const i18nKeyWithMethod = getI18nKey(`${stepName}.authenticator.${options.key}.${methodType}`);
  if (i18nKeyWithMethod) {
    return i18nKeyWithMethod;
  }

  // try get i18nKey with authenticator.methodType in key
  const i18nKeyWithMethodTypeInKey = getI18nKey(`${stepName}.${options.key}.authenticator.methodType.${methodType}`);
  if (i18nKeyWithMethodTypeInKey) {
    return i18nKeyWithMethodTypeInKey;
  }

  return '';
};

export const transformAuthenticatorButton: TransformStepFnWithOptions = ({
  transaction,
}) => (
  formbag,
) => {
  const AUTHENTICATORS_TO_TRANSLATE_DESCRIPTION = [
    AUTHENTICATOR_KEY.CUSTOM_APP,
    AUTHENTICATOR_KEY.OV,
  ];

  traverseLayout({
    layout: formbag.uischema,
    predicate: (element) => element.type === 'AuthenticatorButtonList',
    callback: (ele) => {
      const { nextStep } = transaction;
      const { relatesTo, name: stepName } = nextStep!;
      const authenticatorKey = relatesTo?.value?.key;
      const params = getI18NParams(nextStep, authenticatorKey);
      const buttonListElement = ele as AuthenticatorButtonListElement;
      buttonListElement.options.buttons.forEach(
        (authenticatorButtonElement: AuthenticatorButtonElement) => {
          const i18nKey = getAuthenticatorButtonKey(stepName, authenticatorButtonElement.options);
          const {
            label,
            options: {
              key,
              description,
              isEnroll,
            },
          } = authenticatorButtonElement;
          const translateDescription = !isEnroll
            && AUTHENTICATORS_TO_TRANSLATE_DESCRIPTION.includes(key);
          addTranslation({
            element: authenticatorButtonElement,
            name: translateDescription ? 'description' : 'label',
            i18nKey,
            params,
            defaultValue: translateDescription ? description : label,
          });
        },
      );
    },
  });
  return formbag;
};
