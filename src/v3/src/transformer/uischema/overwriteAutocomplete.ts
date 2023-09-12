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
  FieldElement,
  TransformStepFnWithOptions,
} from '../../types';
import { traverseLayout } from '../util';

export const overwriteAutocomplete: TransformStepFnWithOptions = ({
  widgetProps,
}) => (formbag) => {
  const { features: { disableAutocomplete } = {} } = widgetProps;
  if (disableAutocomplete !== true) {
    return formbag;
  }

  traverseLayout({
    layout: formbag.uischema,
    predicate: (el) => (
      // Only grab elements that have autocomplete set to some value other than 'off'
      el.type === 'Field'
      && typeof (el as FieldElement).options.attributes?.autocomplete !== 'undefined'
      && (el as FieldElement).options.attributes?.autocomplete !== 'off'
    ),
    callback: (el) => {
      const fieldElement = (el as FieldElement);
      fieldElement.options.attributes!.autocomplete = 'off';
    },
  });
  return formbag;
};
