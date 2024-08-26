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

import i18next from 'i18next';

import config from '../../../config/config.json';

// Instance of i18next
let i18ni: ReturnType<typeof i18next['createInstance']> | undefined;

// eslint-disable-next-line import/no-mutable-exports
export { i18ni as i18next };

export const initI18next = () => {
  if (i18ni) {
    // Already initialized
    return;
  }

  const ns = ['login', 'country'];
  const defaultNS = 'login';

  // Create and init i18next instance
  i18ni = i18next.createInstance();
  i18ni.init({
    defaultNS,
    ns,
    fallbackLng: config.defaultLanguage,
    load: 'currentOnly',
    keySeparator: false,
    nsSeparator: ':',
    interpolation: {
      prefix: '{',
      suffix: '}',
      // No need to escape
      // Need to use raw value for phone numbers containing `&lrm;`
      // React is already safe from XSS
      escapeValue: false,
      skipOnVariables: false, // to handle translations that use nesting
    },
  });
};
