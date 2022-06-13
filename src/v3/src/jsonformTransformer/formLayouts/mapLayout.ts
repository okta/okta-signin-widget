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

import { ControlElement, Layout } from '@jsonforms/core';

import { LayoutType } from '../../types';

// TODO: type layout schema
export const mapLayout = (layout: any, elements: ControlElement[]): Layout => {
  const res: Layout = {
    type: layout.type,
    elements: [],
  };

  return layout.elements
    .map((element: any) => {
      if (typeof element === 'string') {
        return {
          name: element,
          // add default mapFn to picker schema
          // by default it returns whatever schema find in generic elements list
          // to transform the found element, add a new mapFn in the picker schema
          mapFn: (schema: any, _options: any) => schema,
        };
      }
      return element;
    })
    .reduce((acc: Layout, layoutElement: any) => {
      let element;
      if (layoutElement.mapFn) {
        const schema = elements.find((el) => el.options?.name === layoutElement.name);
        if (!schema) {
          throw new Error(`Cannot find UI element by ${layoutElement.name}`);
        }
        element = layoutElement.mapFn(schema, layoutElement);
      } else if (Object.values(LayoutType).includes(layoutElement.type)) {
        // dfs layout element
        element = mapLayout(layoutElement, elements); // recursive call
      } else {
        // pick element directly if it's not a layout element
        element = layoutElement;
      }

      acc.elements.push(element);
      return acc;
    }, res);
};
