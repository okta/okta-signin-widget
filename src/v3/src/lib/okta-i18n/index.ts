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

import i18n, {
  i18n as i18nType,
  InitOptions,
  ResourceKey,
  WithT,
} from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-chained-backend';
import HttpBackend from 'i18next-http-backend';
import LocalStorageBackend from 'i18next-localstorage-backend';
import {
  getI18n,
  I18nextProvider,
  initReactI18next,
  Trans,
  Translation,
  useTranslation,
  withTranslation,
} from 'react-i18next';

export interface Translations {
  [locale: string]: ResourceKey;
}

interface BackendOptions {
  baseUri: string,
  rewrite: (file: string) => string,
}

export interface LanguageDetectorOptions {
  localeCookieName: string;
}

export interface OktaReactI18nOptions {
  namespace: string;
  supportedLanguages: string[];
  fallbackLanguage: string;
  translations?: Translations;
  debug?: boolean;
  backendOptions: BackendOptions;
  languageDetectorOptions?: LanguageDetectorOptions;
}

export const initOktaReactI18n = ({
  namespace,
  supportedLanguages,
  fallbackLanguage,
  translations = {},
  debug = false,
  backendOptions,
  languageDetectorOptions,
}: OktaReactI18nOptions): void => {
  const config: InitOptions = {
    debug,
    defaultNS: namespace,
    ns: [namespace],
    fallbackLng: fallbackLanguage,
    supportedLngs: supportedLanguages,
    load: 'currentOnly',
    keySeparator: false,
    interpolation: {
      escapeValue: false, // react already safe from xss
      // The existing SIW properties use single braces as delimiters
      prefix: '{',
      suffix: '}',
    },
    react: {
      useSuspense: false,
      // wait: true,
    },
  };

  config.backend = {
    backends: [
      LocalStorageBackend, // primary
      HttpBackend, // fallback
    ],
    backendOptions: [{
      prefix: 'okta_i18n_',
      store: window.localStorage,
    }, {
      // we can override baseUri and rewrite the path here
      loadPath: (locale: string) => {
        const filePath = backendOptions.rewrite(`/labels/json/login_${locale}.json`);

        return `${backendOptions.baseUri}${filePath}`;
      },
      crossDomain: false,
      // this is the default implementation of parse, but we can use it to override values later
      parse: (data: any) => JSON.parse(data),
    }],
  };

  i18n.use(Backend);

  if (languageDetectorOptions) {
    const { localeCookieName } = languageDetectorOptions;

    const LanguageDetectorOptions = {
      order: ['querystring', 'cookie', 'navigator'],
      // keys or params to lookup language from
      lookupQuerystring: 'lang',
      lookupCookie: localeCookieName,
    };

    const languageDetector = new LanguageDetector(null, LanguageDetectorOptions);

    i18n.use(languageDetector);
  }

  i18n
    .use(initReactI18next) // passes i18n down to react-i18next
    .init(config);

  Object.entries(translations).forEach(([locale, property]) => {
    i18n.addResourceBundle(locale, namespace, property);
  });

  i18n.setDefaultNamespace(namespace);
};

export {
  getI18n, i18n, I18nextProvider, Trans, Translation, useTranslation, withTranslation,
};

export interface WithTranslation extends WithT {
  i18n: i18nType;
  tReady: boolean;
}
