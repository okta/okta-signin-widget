/*
 * Copyright (c) 2022-present, Okta, Inc. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant
 * to the Apache License, Version 2.0 (the "License.")
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { TransformStepFnWithOptions } from '../../types';
import { generateRandomString } from '../../util';
import { traverseLayout } from '../util';

export const addKeyToElement: TransformStepFnWithOptions = ({ transaction }) => (formbag) => {
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
