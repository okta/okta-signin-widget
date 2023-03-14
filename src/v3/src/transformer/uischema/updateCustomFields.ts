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

import { IdxOption } from '@okta/okta-auth-js/types/lib/idx/types/idx-js';

import CountryUtil from '../../../../util/CountryUtil';
import TimeZone from '../../../../v2/view-builder/utils/TimeZone';
import {
  FieldElement,
  TransformStepFn,
} from '../../types';
import { traverseLayout } from '../util';

export const updateCustomFields: TransformStepFn = (formbag) => {
  traverseLayout({
    layout: formbag.uischema,
    predicate: (el) => (el.type === 'Field'),
    callback: (el) => {
      const fieldElement = (el as FieldElement);
      const { options: { inputMeta: { options } } } = fieldElement;

      if (fieldElement.options.inputMeta.name === 'userProfile.timezone') {
        fieldElement.options.format = 'select';
        fieldElement.options.customOptions = Object.entries(TimeZone).map(([code, label]) => ({
          label,
          value: code,
        } as IdxOption));
      }

      if (Array.isArray(options) && options[0]?.value) {
        const [option] = options;
        if (option.label === 'display') {
          // TODO: OKTA-538689 Missing type in interface, have to cast to any
          const input = (option.value as any)?.value;
          fieldElement.options.format = input.inputType;
          fieldElement.options.customOptions = input.options;
          if (input.inputType === 'select' && input.format === 'country-code') {
            const countryCodeObj = CountryUtil.getCountryCode();
            const countryOptions = Object.entries(countryCodeObj).map(([code, label]) => ({
              label,
              value: code,
            } as IdxOption));
            fieldElement.options.customOptions = countryOptions;
          } else if (input.inputType === 'text') {
            // Text type that has options must remove options for renderers.tsx
            // to map to correct element
            fieldElement.options.inputMeta.options = undefined;
          }
        }
      }
    },
  });
  return formbag;
};
