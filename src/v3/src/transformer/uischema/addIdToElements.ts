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

import { TransformStepFn } from '../../types';
import { generateRandomString } from '../../util';
import { traverseLayout } from '../util';

export const addIdToElements: TransformStepFn = (formbag) => {
  const elementIdSet = new Set<string>();
  let elementCount = 0;
  traverseLayout({
    layout: formbag.uischema,
    predicate: (element) => !!element.type,
    callback: (element) => {
      elementCount += 1;
      let elementId = `${element.key}_${elementCount}`;
      elementId += [
        (typeof element.viewIndex !== 'undefined' ? (element.viewIndex + 1) : undefined),
      ].filter(Boolean).map((str) => `_${str}`).join('');
      // eslint-disable-next-line no-param-reassign
      element.id = elementIdSet.has(elementId)
        ? `${elementId}_${generateRandomString()}`
        : elementId;
      elementIdSet.add(elementId);
    },
  });
  return formbag;
};
