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

import union from 'lodash/union';

import config from '../../../config/config.json';
import { LanguageCode } from '../../../types';
import BrowserFeatures from '../../../util/BrowserFeatures';
import Util from '../../../util/Util';
import { WidgetProps } from '../types';

export const getSupportedLanguages = (widgetProps: WidgetProps): string[] => {
  const { i18n, language, assets: { languages } = {} } = widgetProps;
  const supportedLanguages = languages || config.supportedLanguages;
  const customLanguages = Object.keys(i18n || {});

  return union(
    supportedLanguages,
    customLanguages,
    typeof language === 'string' ? [language] : [],
  );
};

export const getLanguageCode = (widgetProps: WidgetProps): LanguageCode => {
  const { language } = widgetProps;
  const supportedLanguages = getSupportedLanguages(widgetProps);
  const userLanguages = BrowserFeatures.getUserLanguages().map((lang: string) => {
    if (lang === 'nl') {
      return 'nl-NL';
    }
    if (lang === 'pt') {
      return 'pt-BR';
    }
    return lang;
  });

  const preferredLanguages = [...userLanguages];
  const supportedLangsLowercase = Util.toLower(supportedLanguages);

  // Any developer defined "language" takes highest priority:
  // As a string, i.e. 'en', 'ja', 'zh-CN'
  if (typeof language === 'string') {
    preferredLanguages.unshift(language);
  } else if (typeof language === 'function') {
    // As a callback function, which is passed the list of supported
    // languages and detected user languages. This function must return
    // a languageCode, i.e. 'en', 'ja', 'zh-CN'
    preferredLanguages.unshift(language(supportedLanguages as LanguageCode[], userLanguages));
  }

  // Add default language, and expand to include any language
  // codes that do not include region, dialect, etc.
  preferredLanguages.push(config.defaultLanguage);
  const expanded = Util.toLower(Util.expandLanguages(preferredLanguages));

  // Perform a case insensitive search - this is necessary in the case
  // of browsers like Safari
  const foundLang = expanded.find(
    (preferredLang) => supportedLangsLowercase.includes(preferredLang),
  );
  const supportedPos = supportedLangsLowercase.findIndex(
    (supportedLang) => supportedLang === foundLang,
  );

  return (supportedLanguages[supportedPos] ?? config.defaultLanguage) as LanguageCode;
};

export const getBackToSignInUri = (widgetProps: WidgetProps): string | undefined => {
  const { backToSignInLink, signOutLink } = widgetProps;
  return backToSignInLink || signOutLink;
};

export const getBaseUrl = (widgetProps: WidgetProps): string | undefined => {
  const {
    authClient, authParams, baseUrl, issuer,
  } = widgetProps;

  if (baseUrl) {
    return baseUrl;
  }

  if (authClient) {
    return authClient.getIssuerOrigin();
  }
  const issuerPath = issuer || authParams?.issuer;
  const [parsedBaseUrl] = issuerPath?.split('/oauth2/') ?? [];
  return parsedBaseUrl;
};
