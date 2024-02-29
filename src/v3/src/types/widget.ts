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
  FlowIdentifier,
  IdxActionParams,
  OktaAuthOptions,
} from '@okta/okta-auth-js';
import {
  RawIdxResponse,
} from '@okta/okta-auth-js/types/lib/idx/types/idx-js';
import { TinyEmitter as EventEmitter } from 'tiny-emitter';

import {
  EventCallback,
  EventCallbackWithError,
  EventContext,
  HooksOptions,
  LanguageCallback,
  LanguageCode,
  RegistrationErrorCallback,
  RegistrationOptions as RegOptions,
  RenderError,
  RenderResult,
  UserOperation,
} from '../../../types';
import { InterstitialRedirectView } from '../constants';
import { DesignTokensType } from '../util/designTokens';
import { WidgetHooks } from '../util/widgetHooks';
import { OktaSignInAPI } from './api';
import { JsonObject } from './json';
import { Modify } from './jsonforms';
import { FormBag, RegistrationElementSchema } from './schema';

// TODO: Once SIW is merged into okta-signin-widget repo, remove this. Ticket#: OKTA-508189
export interface EventErrorContext {
  xhr?: ErrorXHR;

  // Classic
  name?: string;
  message?: string;
  statusCode?: number;

  // OIE
  errorSummary?: string
}

// TODO: Once SIW is merged into okta-signin-widget repo, remove this. Ticket#: OKTA-508189
export interface ErrorXHR {
  status: number;
  responseType?: string;
  responseText: string;
  responseJSON?: { [propName: string]: any; };
}

export type RenderOptions = {
  el?: string;
  clientId?: string;
  redirectUri?: string;
  redirect?: 'always' | 'never';
  authParams?: OktaAuthOptions;
};

export type AuthenticationMode = 'remediation' | 'relying-party';

export type OktaWidgetEventHandler = EventCallback | EventCallbackWithError;

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

export type RegistrationSchemaCallbackV3 = (schema: RegistrationElementSchema[]) => void;
export type RegistrationDataCallbackV3 = (postData: IdxActionParams) => void;
export type RegistrationOptionsV3 = Modify<RegOptions, {
  parseSchema?: (
    schema: RegistrationElementSchema[],
    onSuccess: RegistrationSchemaCallbackV3,
    onFailure: RegistrationErrorCallback
  ) => void;
  preSubmit?: (
    postData: IdxActionParams,
    onSuccess: RegistrationDataCallbackV3,
    onFailure: RegistrationErrorCallback
  ) => void;
}>;
type PageTitleCallbackParam = {
  brandName?: string;
  formTitle: string;
};
export type PageTitleCallback = (context: EventContext, param: PageTitleCallbackParam) => string;

export type OktaWidgetEventType = 'ready' | 'afterError' | 'afterRender';
export type IDPDisplayType = 'PRIMARY' | 'SECONDARY';

export type WidgetProps = Partial<WidgetOptions> & {
  eventEmitter: EventEmitter;
  widgetHooks: WidgetHooks; // instance of class WidgetHooks
};

export type WidgetOptions = {
  // brand colors
  brandColors?: BrandColors;

  // theme
  theme?: { tokens: DesignTokensType }; // & ThemeOptions;

  // hooks
  hooks?: HooksOptions; // object in options

  // callbacks
  onChange?: (data: JsonObject) => void;
  onSubmit?: (data: JsonObject) => void;
  onCancel?: (data: JsonObject) => void;

  // lifecycle hooks
  beforeCreate?: (options: WidgetOptions) => void;
  afterCreate?: () => void;

  beforeTransform?: (ionResponse: RawIdxResponse) => void;
  afterTransform?: (formBag: FormBag, ionResponse: RawIdxResponse) => void;

  // beforeValidate?: (data: JsonObject, schema: JsonSchema7) => Record<string, unknown> | void;
  // afterValidate?: (isValid: boolean, data: JsonObject, schema: JsonSchema7) => void;

  beforeSubmit?: (data: JsonObject) => void;
  afterSubmit?: (data: JsonObject) => void;

  authParams?: OktaAuthOptions; // configs passed to authjs sdk
  authClient?: OktaSignInAPI['authClient']; // instance of authjs

  issuer?: string;
  clientId?: string;
  redirectUri?: string;
  redirect?: 'always' | 'never' | 'auto';
  state?: string;
  scopes?: string[];
  flow?: FlowIdentifier;
  codeChallenge?: string;
  codeChallengeMethod?: string;
  recoveryToken?: string;

  el?: string;
  cspNonce?: string;
  otp?: string;
  baseUrl?: string;
  brandName?: string;
  logo?: string;
  logoText?: string;
  stateToken?: string;
  username?: string;
  signOutLink?: string;
  backToSignInLink?: string;
  consent?: {
    cancel: { (): void };
  };
  /**
   * @deprecated
   * Deprecated as of SIW v7.0
   */
  useInteractionCodeFlow?: boolean;
  authScheme?: string;
  relayState?: string;
  proxyIdxResponse?: ProxyIdxResponse;
  overrideExistingStateToken?: boolean;
  interstitialBeforeLoginRedirect?: InterstitialRedirectView;
  idpDiscovery?: {
    requestContext: string;
  };
  idpDisplay?: IDPDisplayType;
  assets?: {
    baseUrl?: string;
    languages?: string[];
    rewrite?: (assetPath: string) => string;
  };
  i18n?: Record<LanguageCode, { [i18nKey: string]: string }>;
  piv?: {
    certAuthUrl?: string;
    isCustomDomain?: boolean;
    text?: string;
    className?: string;
  };
  customButtons?: CustomButton[];
  registration?: RegistrationOptionsV3;
  features?: OktaWidgetFeatures;
  language?: LanguageCode | LanguageCallback | string;
  helpSupportNumber?: string;
  helpLinks?: {
    help?: string;
    custom?: CustomLink[];
    factorPage?: Omit<CustomLink, 'target'>;
    forgotPassword?: string;
    unlock?: string;
  };
  defaultCountryCode?: string;
  transformUsername?: (username: string, operation: UserOperation) => string;
  globalSuccessFn?: (res: RenderResult) => void;
  globalErrorFn?: (res: RenderError) => void;
};

export type IdxMethod =
  | 'authenticate'
  | 'recoverPassword'
  | 'register'
  | 'poll'
  | 'proceed'
  | 'unlock-account';

export type BrandColors = {
  primaryColor: string;
};

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
  autoFocus?: boolean;
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
  mfaOnlyFlow?: boolean;
  hideBackToSignInForReset?: boolean;
  rememberMyUsernameOnOIE?: boolean;
  engFastpassMultipleAccounts?: boolean;
  customExpiredPassword?: boolean;
  idpDiscovery?: boolean;
  passwordlessAuth?: boolean;
  consent?: boolean;
  skipIdpFactorVerificationBtn?: boolean;
  showKeepMeSignedIn?: boolean;
  showPasswordToggleOnSignInPage?: boolean;
  showIdentifier?: boolean;
  registration?: boolean;
  redirectByFormSubmit?: boolean;
  restrictRedirectToForeground?: boolean;
  showPasswordRequirementsAsHtmlList?: boolean;
  disableAutocomplete?: boolean;
  setPageTitle?: boolean | string | PageTitleCallback;
  serverGeneratedUISchemaEnabled?: boolean;
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

type CustomButton = {
  title: string;
  className: string;
  i18nKey: string;
  dataAttr?: string;
  click: { (): void }
};

export type CustomLink = {
  text: string;
  href: string;
  target?: '_blank';
};
