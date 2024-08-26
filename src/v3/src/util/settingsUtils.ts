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

import { APIError, IdxActionParams, IdxTransaction } from '@okta/okta-auth-js';
import { union } from 'lodash';

import config from '../../../config/config.json';
import {
  EventContext,
  LanguageCode,
  RegistrationErrorCallback,
  RegistrationPostSubmitCallback,
  UserOperation,
} from '../../../types';
import BrowserFeatures from '../../../util/BrowserFeatures';
import CountryUtil from '../../../util/CountryUtil';
import Logger from '../../../util/Logger';
import Util from '../../../util/Util';
import { FORM_NAME_TO_OPERATION_MAP } from '../constants';
import {
  AuthenticationMode,
  CustomLink,
  RegistrationDataCallbackV3,
  RegistrationElementSchema,
  RegistrationSchemaCallbackV3,
  WidgetProps,
} from '../types';
import { getEventContext } from './getEventContext';
import { loc } from './locUtil';

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

export const getBackToSignInUri = (widgetProps: WidgetProps): string | undefined => {
  const { backToSignInLink, signOutLink } = widgetProps;
  return backToSignInLink || signOutLink;
};

export const getForgotPasswordUri = (widgetProps: WidgetProps): string | undefined => {
  const { forgotPassword } = widgetProps.helpLinks || {};
  return forgotPassword;
};

export const getUnlockAccountUri = (widgetProps: WidgetProps): string | undefined => {
  const { unlock } = widgetProps.helpLinks || {};
  return unlock;
};

export const getHelpLink = (widgetProps: WidgetProps): string => {
  const { help } = widgetProps.helpLinks || {};
  return help || `${getBaseUrl(widgetProps)}/help/login`;
};

export const getCustomHelpLinks = (widgetProps: WidgetProps): CustomLink[] => {
  const { custom } = widgetProps.helpLinks || {};
  return custom || [];
};

export const getFactorPageCustomLink = (widgetProps: WidgetProps): Omit<CustomLink, 'target'> | undefined => {
  const { factorPage } = widgetProps.helpLinks || {};
  return typeof factorPage !== 'undefined' && 'href' in factorPage ? factorPage : undefined;
};

export const getDefaultCountryCode = (widgetProps: WidgetProps): string => {
  const defaultCountry = 'US';
  const { defaultCountryCode } = widgetProps;
  if (typeof defaultCountryCode === 'undefined') {
    return defaultCountry;
  }
  const countries = CountryUtil.getCountries();
  return Object.keys(countries).includes(defaultCountryCode)
    ? defaultCountryCode : defaultCountry;
};

export const parseRegistrationSchema = (
  widgetProps: WidgetProps,
  schema: RegistrationElementSchema[],
  onSuccess: RegistrationSchemaCallbackV3,
  onFailure: RegistrationErrorCallback,
): void => {
  const { registration: { parseSchema } = {} } = widgetProps;
  if (typeof parseSchema !== 'function') {
    onSuccess(schema);
    return;
  }

  parseSchema(
    schema,
    (modifiedSchema: RegistrationElementSchema[]) => onSuccess(modifiedSchema),
    (error: APIError) => {
      const errorObj = error || {
        errorSummary: loc('registration.default.callbackhook.error', 'login'),
      };
      onFailure(errorObj);
    },
  );
};

export const preRegistrationSubmit = (
  widgetProps: WidgetProps,
  data: IdxActionParams,
  onSuccess: RegistrationDataCallbackV3,
  onFailure: RegistrationErrorCallback,
): void => {
  const { registration: { preSubmit } = {} } = widgetProps;
  if (typeof preSubmit !== 'function') {
    onSuccess(data);
    return;
  }

  preSubmit(
    data,
    (postData) => onSuccess(postData),
    (error: APIError) => {
      const errorObj = error || {
        errorSummary: loc('registration.default.callbackhook.error', 'login'),
      };
      onFailure(errorObj);
    },
  );
};

export const postRegistrationSubmit = (
  widgetProps: WidgetProps,
  response: string,
  onSuccess: RegistrationPostSubmitCallback,
  onFailure: RegistrationErrorCallback,
): void => {
  const { registration: { postSubmit } = {} } = widgetProps;
  if (typeof postSubmit !== 'function') {
    onSuccess(response);
    return;
  }

  postSubmit(
    response,
    (responseStr) => onSuccess(responseStr),
    (error: APIError) => {
      const errorObj = error || {
        errorSummary: loc('registration.default.callbackhook.error', 'login'),
      };
      onFailure(errorObj);
    },
  );
};

export const transformIdentifier = (
  widgetProps: WidgetProps,
  step: string,
  username: string,
): string => {
  const { transformUsername } = widgetProps;
  if (typeof transformUsername !== 'function') {
    return username;
  }
  const operation: UserOperation = FORM_NAME_TO_OPERATION_MAP[step];
  return transformUsername(username, operation);
};

export const getAuthenticationMode = (widgetProps: WidgetProps): AuthenticationMode => {
  const { codeChallenge } = widgetProps;
  return codeChallenge ? 'remediation' : 'relying-party';
};

export const isOauth2Enabled = (widgetProps: WidgetProps): boolean => {
  const { clientId: clientIdFromSettings, authScheme, authClient } = widgetProps;
  let clientId = clientIdFromSettings;
  if (!clientId && authClient) {
    clientId = authClient.options?.clientId;
  }
  return typeof clientId !== 'undefined' && authScheme?.toLowerCase() === 'oauth2';
};

export const getPageTitle = (
  widgetProps: WidgetProps,
  formTitle: string | null,
  idxTransaction?: IdxTransaction,
): string | null => {
  if (formTitle === null) {
    return null;
  }

  const { brandName, features: { setPageTitle } = {} } = widgetProps;
  const eventContext: EventContext = typeof idxTransaction === 'undefined'
    ? { controller: null }
    : getEventContext(idxTransaction);

  switch (typeof setPageTitle) {
    // When setPageTitle option is 'undefined', default will be to set title based on page header
    // When setPageTitle option is 'true', set title based on page header
    case 'boolean':
    case 'undefined':
      if (setPageTitle === false) {
        // Indicates setPageTitle config option was purposefully disabled
        return null;
      }
      return brandName ? `${brandName} | ${formTitle}` : formTitle;
    case 'string':
      return setPageTitle;
    case 'function':
      return setPageTitle(eventContext, { formTitle, brandName });
    default:
      Logger.error(
        'Invalid value passed to setPageTitle, valid types include boolean, string or function.',
      );
      // Indicates an invalid/unexpected value was passed into the config option
      return null;
  }
};
