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

/* eslint-disable import/extensions */
import 'jest-canvas-mock';

require('@testing-library/jest-dom');
require('whatwg-fetch');
const { createSerializer } = require('@emotion/jest');
const { configure } = require('@testing-library/preact');
const enTranslations = require('./src/properties/json/login.json');
const { initOktaReactI18n } = require('./src/lib/okta-i18n');

configure({
  testIdAttribute: 'data-se',
});

global.DEBUG = false;

expect.addSnapshotSerializer(createSerializer({ includeStyles: false }));

initOktaReactI18n({
  debug: false,
  namespace: 'okta-signin-widget',
  supportedLanguages: ['en'],
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
