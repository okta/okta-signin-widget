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
  TransformStepFnWithOptions, UISchemaLayoutType,
} from '../../types';
import {
  generateRandomString,
  getAuthenticatorKey,
  getCurrentAuthenticator,
} from '../../util';
import { traverseLayout } from '../util';

export const updateElementKeys: TransformStepFnWithOptions = ({ transaction }) => (formbag) => {
  traverseLayout({
    layout: formbag.uischema,
    // never add a synthetic key to layout elements' uischema
    predicate: (element) => ![
      UISchemaLayoutType.STEPPER,
      UISchemaLayoutType.ACCORDION,
      UISchemaLayoutType.HORIZONTAL,
      UISchemaLayoutType.VERTICAL,
    ].includes((element.type) as UISchemaLayoutType),
    callback: (element) => {
      const { nextStep: { name } = {} } = transaction;
      const authKey = getAuthenticatorKey(transaction);
      const authId = getCurrentAuthenticator(transaction)?.value?.id;

      // We need Reminder Elements to unmount from view when new transaction
      // is set, this prevents this alert and error alerts from both displaying
      // at the same time
      if (element.type === 'Reminder') {
        // eslint-disable-next-line no-param-reassign
        element.key = `${name}_${generateRandomString()}`;
      } else {
        let elementKey = typeof element.key !== 'undefined'
          ? `${name}_${element.type}_${element.key}`
          : `${name}_${element.type}`;
        elementKey += [
          authKey,
          authId,
        ].filter(Boolean).map((str) => `_${str}`).join('');
        // eslint-disable-next-line no-param-reassign
        element.key = elementKey;
      }
    },
  });
  return formbag;
};
