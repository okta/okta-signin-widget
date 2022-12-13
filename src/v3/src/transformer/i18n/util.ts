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

import {
  getI18nKey,
  getI18NParams,
} from '../../../../v2/ion/i18nTransformer';
import { FieldElement, UISchemaElement } from '../../types';
import { loc } from '../../util';

export const addTranslation = ({
  element,
  name,
  i18nKey,
  params,
  defaultValue = '',
}: {
  element: UISchemaElement;
  name: string;
  i18nKey: string;
  params?: any;
  defaultValue?: string;
}): void => {
  // TODO: change translations to required field with default value
  // eslint-disable-next-line no-param-reassign
  element.translations = element.translations || [];
  element.translations.push({
    name,
    i18nKey,
    value: i18nKey ? loc(i18nKey, 'login', params) : defaultValue,
  });
};

export const addLabelTranslationToFieldElement = (
  transaction: IdxTransaction,
  element: FieldElement,
): void => {
  const { nextStep } = transaction;
  const { relatesTo, name: stepName } = nextStep!;
  const authenticatorKey = relatesTo?.value?.key;
  const fieldName = element.options.inputMeta.name;
  const path = authenticatorKey
    ? `${stepName}.${authenticatorKey}.${fieldName}`
    : `${stepName}.${fieldName}`;
  const i18nKey = getI18nKey(path);
  const params = getI18NParams(nextStep, authenticatorKey);
  if (i18nKey || element.label) {
    addTranslation({
      element, name: 'label', i18nKey, params, defaultValue: element.label,
    });
  }
};
