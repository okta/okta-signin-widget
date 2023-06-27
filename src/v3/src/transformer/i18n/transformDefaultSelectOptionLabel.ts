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

import { FormBag, TransformStepFn } from '../../types';
import { traverseLayout } from '../util';
import { addTranslation } from './util';

export const transformDefaultSelectOptionLabel: TransformStepFn = (formbag: FormBag) => {
  const { uischema } = formbag;

  traverseLayout({
    layout: uischema,
    // Making this avaialable for any field in case it is customized to be a select type
    predicate: (element) => element.type === 'Field',
    callback: (element) => {
      addTranslation({
        element,
        name: 'empty-option-label',
        i18nKey: 'select.default_value',
      });
    },
  });

  return formbag;
};
