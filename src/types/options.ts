// minimum typescript version: 3.8

import { OktaAuth, OktaAuthOptions } from '@okta/okta-auth-js';
import {
  SimpleCallback,
  RenderResult,
  RenderError,
} from './results';
import { RegistrationOptions } from './registration';

export interface WidgetOptions extends Partial<Pick<OktaAuthOptions,
  'issuer' |
  'clientId' |
  'redirectUri' |
  'state' |
  'scopes' |
  'codeChallenge' |
  'codeChallengeMethod' |
  'flow'
>> {
  el?: string;

  // oidc
  oAuthTimeout?: number;

  // auth client
  authParams?: AuthParams;
  authClient?: OktaAuth;

  // basic config options
  baseUrl?: string;
  logo?: string;
  logoText?: string;
  helpSupportNumber?: string;
  brandName?: string;

  // username and password
  username?: string;
  transformUsername?: (username: string, operation: UserOperation) => string;
  processCreds?: (creds: Creds, callback?: SimpleCallback) => void;

  // language and text
  language?: LanguageCode | LanguageCallback | string;
  i18n?: Record<LanguageCode, Record<string, string>>;
  assets?: {
    baseUrl?: string;
    rewrite?: (assetPath: string) => string;
  };

  // colors
  colors?: Record<ColorKey, string>;

  // links
  helpLinks?: {
    help?: string;
    forgotPassword?: string;
    factorPage?: Link;
    unlock?: string;
    custom?: Array<Link>;
  };

  // sign out link
  signOutLink?: string;

  // buttons
  customButtons?: Array<CustomButton>;

  // registration
  registration?: RegistrationOptions;
  policyId?: string;

  // feature flags
  features?: Record<Feature, boolean>;

  // idp
  idps?: Array<SocialIdp | CustomIdp>;
  idpDisplay?: IdpDisplay;
  idpDiscovery?: {
    requestContext?: string;
  };
  // smart card idp (x509)
  piv?: Piv;

  // bootstrapping
  recoveryToken?: string;
  stateToken?: string;
  relayState?: string;

  // callbacks
  globalSuccessFn?: (res: RenderResult) => void;
  globalErrorFn?: (res: RenderError) => void;

  // idx
  apiVersion?: string;

  // consent
  consent?: {
    cancel?: SimpleCallback;
  };

  /**
   * @deprecated see useClassicEngine
   */
  useInteractionCodeFlow?: boolean;

  /**
   * @default false
   */
  useClassicEngine?: boolean;

  hooks?: HooksOptions;
  proxyIdxResponse?: any;
}

// auth params
export interface AuthParams extends OktaAuthOptions {
  display?: Display;
  nonce?: string;
  authScheme?: string;
}
type Display =
  'popup' |
  'page';

// render options
export type RenderOptions = Omit<WidgetOptions,
  'authClient' |
  'hooks'
>

// idps
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

// types for config
type UserOperation =
  'PRIMARY_AUTH' |
  'FORGOT_PASSWORD' |
  'UNLOCK_ACCOUNT';

interface Creds {
  username: string;
  password: string;
}

export type LanguageCode =
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

export type LanguageCallback = (supportedLanguages: Array<LanguageCode>, userLanguages: Array<string>) => LanguageCode;

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

export type HookFunction = () => Promise<void>;
export interface HookDefinition {
  before?: HookFunction[];
  after?: HookFunction[];
}
export interface HooksOptions {
  [name: string]: HookDefinition;
}
