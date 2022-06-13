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

import { initOktaReactI18n } from './lib/okta-i18n';
import enTranslations from './properties/json/login.json';

initOktaReactI18n({
  debug: false,
  namespace: 'okta-signin-widget',
  supportedLanguages: ['en', 'cs', 'da', 'de', 'el', 'es', 'fi', 'fr', 'hu', 'id', 'it', 'ja', 'ko', 'ms', 'nb',
    'nl_NL', 'ok_PL', 'pl', 'pt_BR', 'ro', 'ru', 'sv', 'th', 'tr', 'uk', 'vi', 'zh_CN', 'zh_TW'],
  fallbackLanguage: 'en',
  translations: {
    en: enTranslations,
  },
  backendOptions: {
    baseUri: '',
    rewrite: (file) => file,
  },
  languageDetectorOptions: {
    localeCookieName: 'okta_user_lang',
  },
});
