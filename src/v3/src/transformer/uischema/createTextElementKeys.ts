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
  DescriptionElement,
  HeadingElement,
  TitleElement,
  TransformStepFn,
} from '../../types';
import { traverseLayout } from '../util';

const textElementTypes = new Set([
  'Title',
  'Heading',
  'Description',
]);

export const createTextElementKeys: TransformStepFn = (formbag) => {
  traverseLayout({
    layout: formbag.uischema,
    predicate: (element) => textElementTypes.has(element.type),
    callback: (element) => {
      const titleEle = element as (DescriptionElement | TitleElement | HeadingElement);
      // eslint-disable-next-line no-param-reassign
      titleEle.key = titleEle.options.content.replace(/['"+.?]/g, '').split(' ').join('_');
    },
  });
  return formbag;
};
