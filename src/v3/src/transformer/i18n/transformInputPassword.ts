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

import { AUTHENTICATOR_KEY, IDX_STEP } from '../../constants';
import {
  FieldElement,
  TransformStepFnWithOptions,
} from '../../types';
import { getAuthenticatorKey } from '../../util';
import { traverseLayout } from '../util';
import { addTranslation } from './util';

export const transformInputPassword: TransformStepFnWithOptions = ({
  transaction,
}) => (formBag) => {
  const { uischema } = formBag;
  const authenticatorKey = getAuthenticatorKey(transaction);

  traverseLayout({
    layout: uischema,
    predicate: (element) => (element as FieldElement).options?.inputMeta?.secret === true,
    callback: (element) => {
      addTranslation({
        element,
        name: 'show',
        i18nKey: 'sensitive.input.show',
      });
      addTranslation({
        element,
        name: 'hide',
        i18nKey: 'sensitive.input.hide',
      });

      // Odyssey's PasswordField hardcodes the show/hide toggle's accessible name to a single
      // string for every field. Resolve a distinct, context-specific label per field so the
      // toggles are distinguishable to screen readers (WCAG 2.4.6). See OKTA-1164538/-1164535/
      // -1164537/-1164549. Applied to the rendered button in InputPassword.tsx.
      const { options: { inputMeta: { name: fieldName } } } = (element as FieldElement);
      let showLabelKey = 'oie.password.showPassword';
      if (fieldName === 'confirmPassword') {
        showLabelKey = 'oie.password.showConfirmPassword';
      } else if (fieldName === 'credentials.answer') {
        showLabelKey = 'oie.challenge.answer.showAnswer';
      } else if (fieldName === 'credentials.passcode') {
        if (authenticatorKey === AUTHENTICATOR_KEY.YUBIKEY) {
          showLabelKey = 'oie.yubikey.passcode.show';
        } else if (transaction.nextStep?.name === IDX_STEP.RESET_AUTHENTICATOR) {
          showLabelKey = 'oie.password.showNewPassword';
        }
      }
      addTranslation({
        element,
        name: 'visibilityToggleLabel',
        i18nKey: showLabelKey,
      });
    },
  });

  return formBag;
};
