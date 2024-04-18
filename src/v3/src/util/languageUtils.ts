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

import { OdysseyI18nResourceKeys, odysseyI18nResourceKeysList } from '@okta/odyssey-react-mui';

import Bundles from '../../../util/Bundles';
import { WidgetProps } from '../types';
import { getLanguageCode, getSupportedLanguages } from './settingsUtils';

export const loadLanguage = async (widgetProps: WidgetProps): Promise<void> => {
  const { i18n = {}, assets: { baseUrl, rewrite } = {} } = widgetProps;
  const languageCode = getLanguageCode(widgetProps);
  const supportedLanguages = getSupportedLanguages(widgetProps);

  // NOTE: If assets.baseUrl equals "/", SIW will incorrectly try to load language files
  // from URL http://labels/json/login_xx.json
  // Remove trailing slashes to match Gen2 behavior
  let assetsBaseUrl = baseUrl ?? '';
  if (assetsBaseUrl[assetsBaseUrl.length - 1] === '/') {
    assetsBaseUrl = assetsBaseUrl.substring(0, assetsBaseUrl.length - 1);
  }

  return Bundles.loadLanguage(languageCode, i18n, {
    baseUrl: assetsBaseUrl,
    rewrite: rewrite ?? ((val) => val),
  }, supportedLanguages);
};

export const getOdysseyTranslationOverrides = (): Partial<OdysseyI18nResourceKeys> => (
  odysseyI18nResourceKeysList
    .reduce((overrides: Partial<OdysseyI18nResourceKeys>,
      key: typeof odysseyI18nResourceKeysList[number]) => {
      const updatedOverrides = { ...overrides };
      if (Bundles.login && Object.prototype.hasOwnProperty.call(Bundles.login, key)) {
        updatedOverrides[key] = (Bundles.login as Partial<OdysseyI18nResourceKeys>)[key];
      }
      return updatedOverrides;
    }, {})
);
