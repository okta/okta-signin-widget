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

import { FieldElement, TransformStepFn, UISchemaElement } from '../../types';
import { traverseLayout } from '../util';

/**
 * The purpose of this function is to apply the ID of PasswordRequirement List element
 * as the aria-describedby value to Password Text Fields
 */
export const updatePasswordDescribedByValue: TransformStepFn = (formbag) => {
  const passwordRequirementsElement: UISchemaElement[] = [];
  traverseLayout({
    layout: formbag.uischema,
    predicate: (el) => el.type === 'PasswordRequirements',
    callback: (el) => {
      passwordRequirementsElement.push(el);
    },
  });

  if (passwordRequirementsElement.length === 0) {
    return formbag;
  }

  traverseLayout({
    layout: formbag.uischema,
    predicate: (el) => el.type === 'Field' && !!(el as FieldElement).options.inputMeta.secret,
    callback: (el) => {
      const descriptiveElementIds = passwordRequirementsElement
        .filter(
          (descrEle: UISchemaElement) => typeof descrEle.viewIndex === 'undefined'
            || descrEle.viewIndex === el.viewIndex,
        ).map((descrEle) => descrEle.id).join(' ');
      // eslint-disable-next-line no-param-reassign
      el.ariaDescribedBy = typeof el.ariaDescribedBy === 'undefined'
        ? descriptiveElementIds
        : `${el.ariaDescribedBy} ${descriptiveElementIds}`;
    },
  });
  return formbag;
};
