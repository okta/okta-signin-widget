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

import config from '../../../config/config.json';
import { LanguageCode } from '../../../types';
import Bundles from '../../../util/Bundles';
import { WidgetProps } from '../types';
import { i18next, initI18next } from './i18next';
import { getLanguageCode, getSupportedLanguages } from './settingsUtils';

export const initDefaultLanguage = () => {
  initI18next();

  // Load translations for default language from Bundles to i18next
  const languageCode = Bundles.currentLanguage ?? config.defaultLanguage;
  const isDefaultLanguage = !Bundles.currentLanguage;
  if (isDefaultLanguage && !i18next?.hasResourceBundle(languageCode, 'login')) {
    i18next?.addResourceBundle(languageCode, 'login', Bundles.login);
    i18next?.addResourceBundle(languageCode, 'country', Bundles.country);
  }
};

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

  await Bundles.loadLanguage(languageCode, i18n, {
    baseUrl: assetsBaseUrl,
    rewrite: rewrite ?? ((val) => val),
  }, supportedLanguages);

  // Load translations from Bundles to i18next and change language
  i18next?.addResourceBundle(languageCode, 'login', Bundles.login);
  i18next?.addResourceBundle(languageCode, 'country', Bundles.country);
  i18next?.changeLanguage(languageCode);
};

export const unloadLanguage = (languageCode: LanguageCode) => {
  // Remove translations from i18next
  if (languageCode !== config.defaultLanguage) {
    i18next?.removeResourceBundle(languageCode, 'login');
    i18next?.removeResourceBundle(languageCode, 'country');
  }
  i18next?.changeLanguage(undefined);
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
