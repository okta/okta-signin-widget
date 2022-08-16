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

import { IdxMessage } from '@okta/okta-auth-js';

import countryCallingCodes from '../../../../util/countryCallingCodes';
import {
  FieldElement,
  TransformStepFn,
} from '../../types';
import { loc } from '../../util';
import { traverseLayout } from '../util';

export const getUniqueCountryCodes = (): string[] => {
  const uniqueCodes: string[] = [];
  const excludedCountries = ['HM', 'BV', 'TF'];
  Object.entries(countryCallingCodes).forEach(([country, code]) => {
    if (!uniqueCodes.includes(code) && !excludedCountries.includes(country)) {
      uniqueCodes.push(code);
    }
  });
  return uniqueCodes;
};

export const isPhoneNumberSet = (phoneNumber?: string): boolean => {
  if (!phoneNumber) {
    return false;
  }

  const uniqueCodes: string[] = getUniqueCountryCodes();
  const countryCode = uniqueCodes.find((code) => {
    const endIndex = code.length + 1;
    return phoneNumber.substring(1, endIndex) === code;
  });
  if (!countryCode) {
    return true;
  }
  const [phoneWithCountryCode] = phoneNumber.split('x');
  const phoneNumberOnly = phoneWithCountryCode.substring(countryCode.length + 1);
  return !!phoneNumberOnly;
};

export const addPhoneValidation: TransformStepFn = (formbag) => {
  const { uischema, dataSchema } = formbag;

  traverseLayout({
    layout: uischema,
    predicate: (element) => (element as FieldElement).options?.inputMeta?.name?.endsWith('phoneNumber'),
    callback: (element) => {
      const fieldElement = element as FieldElement;
      const { options: { inputMeta: { name } } } = fieldElement;
      dataSchema[name] = {
        validate: (data) => {
          const errorMessage: Partial<IdxMessage> = {
            message: loc('model.validation.field.blank', 'login'),
            i18n: { key: 'model.validation.field.blank' },
          };
          const isValid = isPhoneNumberSet(data[name] as string);
          return isValid ? undefined : [errorMessage];
        },
      };
    },
  });

  return formbag;
};
