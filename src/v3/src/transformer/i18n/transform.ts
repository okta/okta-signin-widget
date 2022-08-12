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

import { getI18NParams, getI18NValue, getMessage } from '../../../../v2/ion/i18nTransformer';
import {
  AuthenticatorButtonElement,
  FieldElement,
  FormBag,
  TransformStepFnWithOptions, UISchemaElement,
} from '../../types';
import { loc } from '../../util';
import { traverseLayout } from '../util';

const getI18nOptions = (transaction: IdxTransaction, element: UISchemaElement) => {
  const { nextStep } = transaction;
  const { relatesTo, name: stepName = '' } = nextStep!;
  const authenticatorKey = relatesTo?.value?.key || '';
  const fieldName = (element as FieldElement).options?.inputMeta?.name;

  let path = '';
  const params = getI18NParams(nextStep, authenticatorKey);
  if (element.type === 'Field') {
    path = authenticatorKey
      ? `${stepName}.${authenticatorKey}.${fieldName}`
      : `${stepName}.${fieldName}`;
  } else if (element.type === 'AuthenticatorButton') {
    const methodType = (
      element as AuthenticatorButtonElement
    ).options.authenticator?.methods?.[0]?.type;
    path = methodType
      ? `${stepName}.authenticator.${(element as AuthenticatorButtonElement).options.key}.${methodType}`
      : `${stepName}.authenticator.${(element as AuthenticatorButtonElement).options.key}`;
  }

  return { path, params };
};

const updateLabel = (transaction: IdxTransaction) => (element: UISchemaElement): void => {
  const { path, params } = getI18nOptions(transaction, element);
  if (element.label) {
    // eslint-disable-next-line no-param-reassign
    element.label = getI18NValue(path, element.label, params);
  }
};

export const uischemaLabelTransformer = (
  transaction: IdxTransaction,
  formBag: FormBag,
): void => {
  traverseLayout({
    layout: formBag.uischema,
    predicate: () => true,
    callback: updateLabel(transaction),
  });
};

export const transactionMessageTransformer = (transaction: IdxTransaction): void => {
  const { messages = [] } = transaction;
  messages.forEach((message) => {
    // @ts-ignore Message interface defined in v2/i18nTransformer JsDoc is incorrect
    // eslint-disable-next-line no-param-reassign
    message.message = getMessage(message);
  });
};

export const transformAdditionalPhoneUITranslations = (formBag: FormBag) => {
  const { uischema } = formBag;

  traverseLayout({
    layout: uischema,
    predicate: (element) => (element as FieldElement).options?.inputMeta?.name.endsWith('phoneNumber'),
    callback: (element) => {
      // eslint-disable-next-line no-param-reassign
      (element as FieldElement).options = {
        ...(element as FieldElement).options,
        translations: [
          {
            name: 'country',
            i18nKey: 'country.label',
            value: loc('country.label', 'login'),
          },
          {
            name: 'extension',
            i18nKey: 'phone.extention.label',
            value: loc('phone.extention.label', 'login'),
          },
        ],
      };
    },
  });

  return formBag;
};

export const transformI18n: TransformStepFnWithOptions = (options) => (formbag) => {
  uischemaLabelTransformer(options.transaction, formbag);
  transformAdditionalPhoneUITranslations(formbag);
  return formbag;
};
