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

import { IdxOption } from '@okta/okta-auth-js/lib/idx/types/idx-js';
import { flow } from 'lodash';

import CountryUtil from '../../../../util/CountryUtil';
import {
  FieldElement,
  TransformStepFn,
  TransformStepFnWithOptions,
  UISchemaElement,
} from '../../types';
import { generateRandomString, isInteractiveType } from '../../util';
import { traverseLayout } from '../util';

const addKeyToElement: TransformStepFnWithOptions = ({ transaction }) => (formbag) => {
  traverseLayout({
    layout: formbag.uischema,
    predicate: (element) => !!element.type,
    callback: (element) => {
      const { nextStep: { name } = {} } = transaction;
      // We need Reminder Elements to unmount from view when new transaction
      // is set, this prevents this alert and error alerts from both displaying
      // at the same time
      if (element.type === 'Reminder') {
        // eslint-disable-next-line no-param-reassign
        element.key = `${name}_${generateRandomString()}`;
      } else {
        // eslint-disable-next-line no-param-reassign
        element.key = element.key ? `${name}_${element.key}` : name;
      }
    },
  });
  return formbag;
};

export const setFocusOnFirstElement: TransformStepFn = (formbag) => {
  let firstFieldFound = false;
  traverseLayout({
    layout: formbag.uischema,
    predicate: (el) => (!firstFieldFound && isInteractiveType(el.type)),
    callback: (el) => {
      const uischemaElement = (el as UISchemaElement);
      uischemaElement.focus = true;
      firstFieldFound = true;
    },
  });
  return formbag;
};

export const updateCustomFields: TransformStepFn = (formbag) => {
  traverseLayout({
    layout: formbag.uischema,
    predicate: (el) => (el.type === 'Field'),
    callback: (el) => {
      const fieldElement = (el as FieldElement);
      const { options: { inputMeta: { options } } } = fieldElement;
      if (Array.isArray(options) && options[0]?.value) {
        const [option] = options;
        if (option.label === 'display') {
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

export const transformUISchema: TransformStepFnWithOptions = (
  options,
) => (formbag) => flow(
  addKeyToElement(options),
  updateCustomFields,
  setFocusOnFirstElement,
)(formbag);
