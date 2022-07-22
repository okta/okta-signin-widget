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
  StepperLayout,
  UISchemaElement,
  UISchemaLayout,
  UISchemaLayoutType,
} from '../../types';

type PredicateFn = (uischema: UISchemaElement) => boolean;
type UpdateFn = (uischema: UISchemaElement) => void;
type Options = {
  layout: UISchemaLayout;
  updateFn: UpdateFn;
  predicateFn?: PredicateFn;
};

export const updateElementsInLayout = (options: Options) => {
  const res: UISchemaElement[] = [];
  const fn = (layout: UISchemaLayout, updateFn: UpdateFn, predicateFn?: PredicateFn) => {
    const { elements } = layout;
    elements.forEach((element) => {
      const { type } = element;
      if (type === UISchemaLayoutType.STEPPER) {
        (element as StepperLayout).elements.forEach((el) => fn(el, updateFn, predicateFn));
        return;
      }

      if ([UISchemaLayoutType.HORIZONTAL, UISchemaLayoutType.VERTICAL]
        .includes(type as UISchemaLayoutType)) {
        fn(element as UISchemaLayout, updateFn, predicateFn);
        return;
      }

      if (!predicateFn) {
        // no predicateFn, update for all elements
        updateFn(element);
      } else if (predicateFn(element)) {
        // update based on predicateFn
        updateFn(element);
      }
    });
  };

  fn(options.layout, options.updateFn, options.predicateFn);
  return res;
};
