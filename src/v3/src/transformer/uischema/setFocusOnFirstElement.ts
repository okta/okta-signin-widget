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
  TransformStepFn,
  UISchemaElement,
} from '../../types';
import { isInteractiveType } from '../../util';
import { traverseLayout } from '../util';

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
