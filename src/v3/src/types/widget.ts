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

import {
  JsonFormsCellRendererRegistryEntry,
  JsonFormsRendererRegistryEntry,
  JsonSchema7,
} from '@jsonforms/core';
import {
  FlowIdentifier,
  OAuthResponseType,
  OktaAuth,
  OktaAuthOptions,
} from '@okta/okta-auth-js';
import {
  RawIdxResponse,
} from '@okta/okta-auth-js/lib/idx/types/idx-js';
import {
  Component,
} from 'preact';
import { OktaReactI18nOptions } from 'src/lib/okta-i18n';

import { JsonObject } from './json';
import { FormBag } from './jsonforms';

export type WidgetProceedArgs = {
  idxMethod?: IdxMethod,
  params?: JsonObject,
  skipValidation?: boolean
  proceedStep?: { step: string };
};

export type WidgetResetArgs = {
  idxMethod?: IdxMethod,
  skipValidation?: boolean;
};

export type WidgetProps = Partial<WidgetOptions>;

export type WidgetOptions = {
  // ui customizations
  renderers?: JsonFormsRendererRegistryEntry[];
  cells?: JsonFormsCellRendererRegistryEntry[];
  components?: Record<string, Component>;

  // theming
  theme?: ThemeOptions;

  // callbacks
  onChange?: (data: JsonObject) => void;
  onSubmit?: (data: JsonObject) => void;
  onCancel?: (data: JsonObject) => void;

  // lifecycle hooks
  beforeCreate?: (options: WidgetOptions) => void;
  afterCreate?: () => void;

  beforeTransform?: (ionResponse: RawIdxResponse) => void;
  afterTransform?: (formBag: FormBag, ionResponse: RawIdxResponse) => void;

  beforeValidate?: (data: JsonObject, schema: JsonSchema7) => Record<string, unknown> | void;
  afterValidate?: (isValid: boolean, data: JsonObject, schema: JsonSchema7) => void;

  beforeSubmit?: (data: JsonObject) => void;
  afterSubmit?: (data: JsonObject) => void;

  authParams?: OktaAuthOptions; // configs passed to authjs sdk
  authClient?: OktaAuth; // instance of authjs

  issuer?: string;
  clientId?: string;
  redirectUri?: string;
  state?: string;
  scopes?: string[];
  flow?: FlowIdentifier;
  codeChallenge?: string;
  codeChallengeMethod?: string;
  recoveryToken?: string;
  responseType?: OAuthResponseType | OAuthResponseType[];

  el?: string;
  baseUrl?: string;
  brandName?: string;
  logo?: string;
  logoText?: string;
  stateToken?: string;
  username?: string;
  signOutLink?: string;
  consent?: {
    cancel: { (): void };
  };
  authScheme?: string;
  relayState?: string;
  proxyIdxResponse?: ProxyIdxResponse;
  overrideExistingStateToken?: boolean;
  interstitialBeforeLoginRedirect?: { (): void };
  idpDiscovery?: {
    requestContext: string;
  };
  assets?: {
    baseUrl: string;
  };
  i18n?: OktaReactI18nOptions;
  piv?: {
    certAuthUrl: string;
    isCustomDomain?: boolean;
    text?: string;
    className?: string;
  };
  customButtons?: CustomButton[];
  features?: OktaWidgetFeatures;
  language?: OktaLanguageCode | string;
  helpSupportNumber?: string;
  helpLinks?: {
    custom?: CustomLink[];
  } & Record<string, string>;
};

export type IdxMethod =
  | 'authenticate'
  | 'recoverPassword'
  | 'register'
  | 'poll'
  | 'proceed'
  | 'unlockAccount';

export type ThemeOptions = {
  primaryColor: string;
  secondaryColor: string;
  primaryContrastColor: string;
  secondaryContrastColor: string;
  faviconURL: string;
};

export type OktaWidgetFeatures = {
  router?: boolean;
  securityImage?: boolean;
  rememberMe?: boolean;
  autoPush?: boolean;
  webauthn?: boolean;
  smsRecovery?: boolean;
  callRecovery?: boolean;
  emailRecovery?: boolean;
  selfServiceUnlock?: boolean;
  multiOptionalFactorEnroll?: boolean;
  deviceFingerprinting?: boolean;
  useDeviceFingerprintForSecurityImage?: boolean;
  trackTypingPattern?: boolean;
  hideSignOutLinkInMFA?: boolean;
  hideBackToSignInForReset?: boolean;
  rememberMyUsernameOnOIE?: boolean;
  engFastpassMultipleAccounts?: boolean;
  customExpiredPassword?: boolean;
  idpDiscovery?: boolean;
  passwordlessAuth?: boolean;
  consent?: boolean;
  skipIdpFactorVerificationBtn?: boolean;
  showPasswordToggleOnSignInPage?: boolean;
  showIdentifier?: boolean;
  registration?: boolean;
  redirectByFormSubmit?: boolean;
  restrictRedirectToForeground?: boolean;
  showPasswordRequirementsAsHtmlList?: boolean;
};

interface ProxyIdxResponse {
  type: 'object',
  value: {
    name: string,
    platform: string,
    enrollmentLink: string,
    vendor: string,
    signInUrl: string,
    orgName: string,
    challengeMethod: string,
  }
}

type OktaLanguageCode =
  | 'cs' // - Czech
  | 'da' // - Danish
  | 'de' // - German
  | 'el' // - Greek
  | 'en' // - English
  | 'es' // - Spanish
  | 'fi' // - Finnish
  | 'fr' // - French
  | 'hu' // - Hungarian
  | 'id' // - Indonesian
  | 'it' // - Italian
  | 'ja' // - Japanese
  | 'ko' // - Korean
  | 'ms' // - Malaysian
  | 'nb' // - Norwegian
  | 'nl-NL' // - Dutch
  | 'pl' // - Polish
  | 'pt-BR' // - Portuguese (Brazil)
  | 'ro' // - Romanian
  | 'ru' // - Russian
  | 'sv' // - Swedish
  | 'th' // - Thai
  | 'tr' // - Turkish
  | 'uk' // - Ukrainian
  | 'zh-CN' // - Chinese (PRC)
  | 'zh-TW'; // - Chinese (Taiwan)

type CustomButton = {
  title: string;
  className: string;
  click: { (): void }
};

type CustomLink = {
  text: string;
  href: string;
};
