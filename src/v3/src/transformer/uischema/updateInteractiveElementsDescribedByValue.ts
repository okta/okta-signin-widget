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

import { TransformStepFn, UISchemaElement } from '../../types';
import { isInteractiveType } from '../../util';
import { traverseLayout } from '../util';

/**
 *
 * The purpose of this function is to apply the IDs of Descriptive text elements
 * (Titles, subtitles, etc) as the aria-describedby value of interactive elements
 * such as Text Inputs, Buttons, etc. This is to allow screen readers to announce
 * the descriptive text when a user focuses on the element. This helps visually impaired
 * users gain more context to an element without the need to scan the page.
 *
 */
export const updateInteractiveElementsDescribedByValue: TransformStepFn = (formbag) => {
  const descriptionElements: UISchemaElement[] = [];
  traverseLayout({
    layout: formbag.uischema,
    predicate: (el) => el.type === 'Title'
      || (el.type === 'Description' && el.contentType === 'subtitle'),
    callback: (el) => {
      descriptionElements.push(el);
    },
  });

  traverseLayout({
    layout: formbag.uischema,
    predicate: (el) => isInteractiveType(el.type) && el.contentType !== 'footer',
    callback: (el) => {
      const descriptiveElementIds = descriptionElements
        .filter(
          (descrEle: UISchemaElement) => typeof descrEle.viewIndex === 'undefined'
            || descrEle.viewIndex === el.viewIndex,
        ).map((descrEle) => descrEle.id).join(' ');
      // eslint-disable-next-line no-param-reassign
      el.ariaDescribedBy = descriptiveElementIds;
    },
  });
  return formbag;
};
