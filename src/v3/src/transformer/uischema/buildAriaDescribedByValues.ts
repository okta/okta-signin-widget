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

import { TransformStepFn, UISchemaElement } from 'src/types';
import { isInteractiveType } from 'src/util';

import { traverseLayout } from '../util';

export const updateElementsWithAriaDescribedByValues: TransformStepFn = (formbag) => {
  const descriptionElements: UISchemaElement[] = [];
  traverseLayout({
    layout: formbag.uischema,
    predicate: (el) => el.type === 'Title' || el.contentType === 'subtitle',
    callback: (el) => {
      descriptionElements.push(el);
    },
  });

  traverseLayout({
    layout: formbag.uischema,
    predicate: (el) => isInteractiveType(el.type),
    callback: (el) => {
      const descriptiveElementIds = descriptionElements
        .filter(
          (descrEle: UISchemaElement) => typeof descrEle.viewIndex === 'undefined'
            || descrEle.viewIndex === el.viewIndex,
        ).map((descrEle) => ` ${descrEle.key} `).join('');
      // eslint-disable-next-line no-param-reassign
      el.ariaDescribedBy = descriptiveElementIds;
    },
  });
  return formbag;
};
