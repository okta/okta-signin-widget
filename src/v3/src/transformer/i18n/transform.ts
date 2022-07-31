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

import { IdxTransaction, Input } from '@okta/okta-auth-js';

import { getI18NParams, getI18NValue, getMessage } from '../../../../v2/ion/i18nTransformer';
import { AUTHENTICATOR_KEY } from '../../constants';
import {
  FieldElement,
  FormBag,
  TransformStepFnWithOptions,
  UISchemaElement,
  WidgetProps,
} from '../../types';
import { getLanguageCode, loc } from '../../util';
import { getOptionValue } from '../selectAuthenticator/utils';

const geti18nPath = (fieldName: string, stepName: string, authenticatorKey: string): string => {
  const authenticatorKeyPath = authenticatorKey
    ? `.${authenticatorKey}`
    : '';
  return `${stepName}${authenticatorKeyPath}.${fieldName}`;
};

const updateLabel = (transaction: IdxTransaction, element: FieldElement): void => {
  const { nextStep } = transaction;
  const { relatesTo, name: stepName = '' } = nextStep || {};
  const authenticatorKey = relatesTo?.value?.key || '';
  const i18nPath = geti18nPath(element.name, stepName, authenticatorKey);

  if (element.label) {
    const params = getI18NParams(nextStep, authenticatorKey);
    // eslint-disable-next-line no-param-reassign
    element.label = getI18NValue(i18nPath, element.label, params);
  }

  if (Array.isArray(element.options?.inputMeta?.options)) {
    element.options.inputMeta.options.forEach((option) => {
      if (!option.label) {
        return;
      }

      let i18nOptionPath = '';
      const optionAuthenticatorKey = option.relatesTo?.key;
      if (optionAuthenticatorKey) {
        i18nOptionPath = `${i18nPath}.${optionAuthenticatorKey}`;

        if (optionAuthenticatorKey === AUTHENTICATOR_KEY.OV && typeof option.value === 'object') {
          const methodType = getOptionValue(option.value as Input[], 'methodType');
          if (methodType?.value) {
            i18nOptionPath = `${i18nOptionPath}.${methodType?.value}`;
          } else if (Array.isArray(methodType?.options)) {
            methodType?.options.forEach((methodTypeOption) => {
              const methodTypeOptionPath = `${i18nOptionPath}.${methodTypeOption.value}`;
              // eslint-disable-next-line no-param-reassign
              methodTypeOption.label = getI18NValue(methodTypeOptionPath, methodTypeOption.label);
            });
          }
        }
      } else if (option.value !== undefined && typeof option.value !== 'object') {
        i18nOptionPath = `${i18nPath}.${option.value}`;
      }
      // eslint-disable-next-line no-param-reassign
      option.label = getI18NValue(i18nOptionPath, option.label);
    });
  }
};

export const uischemaLabelTransformer = (
  transaction: IdxTransaction,
  formBag: FormBag,
): void => {
  formBag.uischema.elements.forEach((element: UISchemaElement) => {
    updateLabel(transaction, element as FieldElement);
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

  const phoneElement = uischema.elements.find((element) => (element as FieldElement)
    .name?.endsWith('phoneNumber')) as FieldElement;

  if (phoneElement) {
    phoneElement.options = {
      ...phoneElement.options,
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
  }
  return formBag;
};

// Determines if key has been overwritten for customization
export const isCustomizedI18nKey = (i18nKey: string, widgetProps: WidgetProps): boolean => {
  const { i18n } = widgetProps;
  const language = getLanguageCode(widgetProps);
  return !!i18n?.[language]?.[i18nKey];
};

export const transformI18n: TransformStepFnWithOptions = (options) => (formbag) => {
  uischemaLabelTransformer(options.transaction, formbag);
  transformAdditionalPhoneUITranslations(formbag);
  return formbag;
};
