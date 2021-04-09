// Minimum TypeScript Version: 3.8

import { OktaAuth, OktaAuthOptions } from '@okta/okta-auth-js';
import {
  SimpleCallback,
  RenderResult,
  RenderError
} from './api';
import * as Registration from './registration';


export type HookFunction = () => Promise<void>;
export interface HookDefinition {
  before?: HookFunction[];
  after?: HookFunction[];
}
export interface HooksOptions {
  [name: string]: HookDefinition;
}
export interface WidgetOptions {
    // Basic config options
    baseUrl?: string;
    logo?: string;
    logoText?: string;
    helpSupportNumber?: string;
    brandName?: string;
    // Username and password
    username?: string;
    transformUsername?: (username: string, operation: UserOperation) => string;
    processCreds?: (creds: Creds, callback?: SimpleCallback) => void;
    // Language and text
    language?: LanguageCode | LanguageCallback;
    i18n?: any; // TODO
    // {
    //   [languageCode in LanguageCode]?: {
    //     [propertyKey: string]: string;
    //   };
    // };
    assets?: {
      baseUrl?: string;
      rewrite?: (assetPath: string) => string;
    };
    // Colors
    colors?: any; // TODO
    // {
    //   [colorKey in ColorKey]?: string;
    // };
    // Links
    helpLinks?: {
      help?: string;
      forgotPassword?: string;
      factorPage?: Link;
      unlock?: string;
      custom?: Array<Link>;
    };
    signOutLink?: string;
    // Buttons
    customButtons?: Array<CustomButton>;
    // Registration
    registration?: Registration.Callbacks;
    policyId?: string;
    // Feature flags
    features?: any; // TODO
    // {
    //   [featureKey in Feature]?: boolean;
    // };
    // OIDC
    clientId?: string;
    redirectUri?: string;
    authParams?: OktaAuthOptions;
    authClient?: OktaAuth;
    oAuthTimeout?: number;
    // IdP
    idps?: Array<SocialIdp | CustomIdp>;
    idpDisplay?: IdpDisplay;
    idpDiscovery?: {
      requestContext?: string;
    };
    // Smart Card IdP (X509)
    piv?: Piv;
    // Bootstrapping
    recoveryToken?: string;
    stateToken?: string;
    relayState?: string;
    // Callbacks
    globalSuccessFn?: (res: RenderResult) => void;
    globalErrorFn?: (res: RenderError) => void;
    // IDX
    apiVersion?: string;
    // Consent
    consent?: {
      cancel?: SimpleCallback;
    };
    useInteractionCodeFlow?: boolean;
    hooks?: HooksOptions;
    proxyIdxResponse?: any;
  }



  // IdPs
  interface SocialIdp {
    type: string;
    id: string;
  }
  interface CustomIdp {
    text: string;
    id: string;
    className?: string;
  }
  type IdpDisplay =
    'PRIMARY' |
    'SECONDARY';
  interface Piv {
    certAuthUrl: string;
    text?: string;
    className?: string;
    isCustomDomain?: boolean;
  }

  // Types for config
  type UserOperation =
    'PRIMARY_AUTH' |
    'FORGOT_PASSWORD' |
    'UNLOCK_ACCOUNT';

  interface Creds {
    username: string;
    password: string;
  }



  type LanguageCode =
    'cs' | // Czech
    'da' | // Danish
    'de' | // German
    'el' | // Greek
    'en' | // English
    'es' | // Spanish
    'fi' | // Finnish
    'fr' | // French
    'hu' | // Hungarian
    'id' | // Indonesian
    'it' | // Italian
    'ja' | // Japanese
    'ko' | // Korean
    'ms' | // Malaysian
    'nb' | // Norwegian
    'nl-NL' | // Dutch
    'pl' | // Polish
    'pt-BR' | // Portuguese (Brazil)
    'ro' | // Romanian
    'ru' | // Russian
    'sv' | // Swedish
    'th' | // Thai
    'tr' | // Turkish
    'uk' | // Ukrainian
    'zh-CN' | // Chinese (PRC)
    'zh-TW'; // Chinese

  type LanguageCallback = (supportedLanguages: Array<LanguageCode>, userLanguages: Array<string>) => LanguageCode;

  export type ColorKey = 'brand';

  export type LinkTarget =
    '_blank' |
    '_self' |
    '_parent' |
    '_top';
  export interface Link {
    text: string;
    href: string;
    target?: LinkTarget;
  }

  export interface CustomButton {
    click: SimpleCallback;
    title?: string;
    i18nKey?: string;
    className?: string;
  }

  export interface FieldError {
    errorSummary: string;
    reason?: string;
    location?: string;
    locationType?: string;
    domain?: string;
  }

  export interface Error {
    errorSummary: string;
    errorCode?: string;
    errorId?: string;
    errorLink?: string;
    errorCauses?: Array<FieldError>;
  }

  export type Feature =
    'router' |
    'securityImage' |
    'rememberMe' |
    'autoPush' |
    'smsRecovery' |
    'callRecovery' |
    'emailRecovery' |
    'webauthn' |
    'selfServiceUnlock' |
    'multiOptionalFactorEnroll' |
    'deviceFingerprinting' |
    'hideSignOutLinkInMFA' |
    'hideBackToSignInForReset' |
    'customExpiredPassword' |
    'registration' |
    'idpDiscovery' |
    'passwordlessAuth' |
    'showPasswordToggleOnSignInPage' |
    'trackTypingPattern' |
    'redirectByFormSubmit' |
    'useDeviceFingerprintForSecurityImage' |
    'showPasswordRequirementsAsHtmlList' |
    'mfaOnlyFlow';

  // Events
  export type Event =
    'ready' |
    'afterError' |
    'afterRender';
  export interface EventContext {
    controller: string;
  }
  export interface EventData {
    page: string;
  }
  export interface EventError {
    name: string;
    message: string;
    statusCode?: number;
    xhr?: ErrorXHR;
  }
  export interface ErrorXHR {
    status: number;
    responseType: 'json';
    responseText: string;
    responseJSON: Error;
  }
  export type EventCallback = (context: EventContext) => void;
  export type EventCallbackWithError = (context: EventContext, error: EventError) => void;


 


