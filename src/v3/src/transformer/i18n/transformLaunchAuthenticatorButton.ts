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
} from '../../types';
import { traverseLayout } from '../util';
import { addTranslation } from './util';

export const transformLaunchAuthenticatorButton: TransformStepFn = (
  formbag,
) => {
  const { uischema } = formbag;

  traverseLayout({
    layout: uischema,
    predicate: (element) => element.type === 'LaunchAuthenticatorButton',
    callback: (element) => {
      addTranslation({
        element,
        name: 'label',
        i18nKey: 'oktaVerify.button',
      });

      addTranslation({
        element,
        name: 'icon-description',
        i18nKey: 'factor.totpSoft.oktaVerify',
      });
    },
  });

  return formbag;
};
