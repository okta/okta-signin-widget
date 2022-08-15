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
import { traverseLayout } from '../util';
import { addTranslation } from './util';
import { getAuthenticatorKey } from '../../util';
import { isCustomizedI18nKey } from './isCustomizedI18nKey';

export const transformIdentifierSublabel: TransformStepFnWithOptions = ({
  transaction,
  widgetProps,
}) => (
  formbag,
) => {
  const { uischema } = formbag;

  traverseLayout({
    layout: uischema,
    predicate: (element) => (element as FieldElement).options?.inputMeta?.name === 'identifier',
    callback: (element) => {
      const { nextStep: { name } = {} } = transaction;
      const authenticatorKey = getAuthenticatorKey(transaction);
      if (!(name === IDX_STEP.IDENTIFY
        || (name !== IDX_STEP.CHALLENGE_AUTHENTICATOR
          && authenticatorKey !== AUTHENTICATOR_KEY.PASSWORD))) {
        return;
      }
      const key = 'primaryauth.username.tooltip';
      if (!isCustomizedI18nKey(key, widgetProps)) {
        return;
      }
      addTranslation({
        element,
        name: 'subLabel',
        i18nKey: key,
      });
    },
  });

  return formbag;
};
