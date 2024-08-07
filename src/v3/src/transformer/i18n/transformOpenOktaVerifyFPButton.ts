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
  OpenOktaVerifyFPButtonElement,
  TransformStepFn,
} from '../../types';
import { traverseLayout } from '../util';
import { addTranslation } from './util';

export const transformOpenOktaVerifyFPButton: TransformStepFn = (
  formbag,
) => {
  const { uischema } = formbag;

  traverseLayout({
    layout: uischema,
    predicate: (element) => element.type === 'OpenOktaVerifyFPButton',
    callback: (element) => {
      const openOktaVerifyButtonElement = (element as OpenOktaVerifyFPButtonElement);
      const { options: { i18nKey } } = openOktaVerifyButtonElement;
      if (i18nKey) {
        addTranslation({
          element,
          name: 'label',
          i18nKey,
        });
      } else {
        addTranslation({
          element,
          name: 'label',
          i18nKey: 'oktaVerify.open.button',
        });
      }
    },
  });

  return formbag;
};
