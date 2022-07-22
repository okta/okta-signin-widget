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

// Temp solution to pass test, will be replaced once https://github.com/okta/okta-signin-widget/pull/2617 is ready

import { IdxTransaction } from '@okta/okta-auth-js';

import { ButtonElement, FieldElement, FormBag } from '../../types';
import { updateElementsInLayout } from '../util';

const map: Record<string, string> = {
  'identify.identifier': 'primaryauth.username.placeholder',
  'identify.credentials.passcode': 'primaryauth.password.placeholder',
  'identify.rememberMe': 'oie.remember',
  'button.identify': 'oie.primaryauth.submit',
  'button.select-enroll-profile': 'registration.form.submit',
  'button.unlock-account': 'unlockaccount',
  'button.currentAuthenticator-recover': 'forgotpassword',
};

export const transformI18n = (
  transaction: IdxTransaction,
) => (
  formbag: FormBag,
): FormBag => {
  const stepName = transaction.nextStep?.name;
  const { uischema } = formbag;

  updateElementsInLayout({
    layout: uischema,
    updateFn: (element) => {
      const { type, options } = element as ButtonElement;
      if (type === 'Button') {
        // eslint-disable-next-line no-param-reassign
        element.label = map[`button.${options?.step}`];
      } else if (type === 'Field') {
        // eslint-disable-next-line no-param-reassign
        element.label = map[`${stepName}.${(options as FieldElement['options']).inputMeta.name}`];
      }
    },
  });

  return formbag;
};
