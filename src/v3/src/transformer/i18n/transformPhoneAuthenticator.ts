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
  FormBag,
  TransformStepFn,
} from '../../types';
import { traverseLayout } from '../util';
import { addTranslation } from './util';

export const transformPhoneAuthenticator: TransformStepFn = (formBag: FormBag) => {
  const { uischema } = formBag;

  traverseLayout({
    layout: uischema,
    predicate: (element) => (element as FieldElement).options?.inputMeta?.name?.endsWith('phoneNumber'),
    callback: (element) => {
      addTranslation({
        element,
        name: 'country',
        i18nKey: 'mfa.country',
      });
      addTranslation({
        element,
        name: 'extension',
        i18nKey: 'phone.extention.label',
      });
    },
  });

  return formBag;
};
