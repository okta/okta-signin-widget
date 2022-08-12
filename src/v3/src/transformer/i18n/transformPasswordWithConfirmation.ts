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
  PasswordWithConfirmationElement,
  TransformStepFnWithOptions,
} from '../../types';
import { traverseLayout } from '../util';
import { addLabelTranslationToFieldElement, addTranslation } from './util';

export const transformPasswordWithConfirmation: TransformStepFnWithOptions = ({
  transaction,
}) => (
  formbag,
) => {
  traverseLayout({
    layout: formbag.uischema,
    predicate: (element) => element.type === 'PasswordWithConfirmation',
    callback: (element) => {
      const { newPasswordElement } = (element as PasswordWithConfirmationElement).options;
      addLabelTranslationToFieldElement(transaction, newPasswordElement);

      const { confirmPasswordElement } = (element as PasswordWithConfirmationElement).options;
      addTranslation({
        element: confirmPasswordElement,
        name: 'label',
        i18nKey: 'oie.password.confirmPasswordLabel',
      });
    },
  });
  return formbag;
};
