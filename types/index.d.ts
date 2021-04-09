// Minimum TypeScript Version: 3.8
declare module '@okta/okta-signin-widget';
import { OktaAuth, OktaAuthOptions, Tokens } from '@okta/okta-auth-js';
/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/no-unused-vars */

declare class OktaSignIn implements OktaSignIn {
  constructor(config: OktaSignIn.WidgetConfig);

  authClient: OktaAuth;

  on(event: 'ready', callback: OktaSignIn.EventCallback): void;
  on(event: 'afterError', callback: OktaSignIn.EventCallbackWithError): void;
  on(event: 'afterRender', callback: OktaSignIn.EventCallback): void;

  off(event?: 'ready', callback?: OktaSignIn.EventCallback): void;
  off(event?: 'afterError', callback?: OktaSignIn.EventCallbackWithError): void;
  off(event?: 'afterRender', callback?: OktaSignIn.EventCallback): void;

  show(): void;
  hide(): void;
  remove(): void;

  showSignInToGetTokens(options: OktaSignIn.ShowSignInToGetTokensOptions): Promise<Tokens>;
  showSignInAndRedirect(options: OktaSignIn.ShowSignInAndRedirectOptions): Promise<void>;
  renderEl(
    options: OktaSignIn.RenderElOptions,
    success?: (res: OktaSignIn.RenderResult) => void,
    error?: (err: OktaSignIn.RenderError) => void
  ): Promise<OktaSignIn.RenderResult>;
}

declare namespace OktaSignIn {
  // Config
  interface WidgetConfig {
    // Basic config options
    baseUrl: string;
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
    i18n?: {
      [languageCode in LanguageCode]?: {
        [propertyKey: string]: string;
      };
    };
    assets?: {
      baseUrl?: string;
      rewrite?: (assetPath: string) => string;
    };
    // Colors
    colors?: {
      [colorKey in ColorKey]?: string;
    };
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
    features?: {
      [featureKey in Feature]?: boolean;
    };
    // OIDC
    clientId?: string;
    redirectUri?: string;
    authParams?: AuthParams;
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
  }

  // Auth params
  interface AuthParams extends OktaAuthOptions {
    display?: Display;
    responseType?: ResponseType | Array<ResponseType>;
    responseMode?: ResponseMode;
    scopes?: Array<Scope>;
    state?: string;
    nonce?: string;
    authScheme?: string;
  }
  type Display =
    'popup' |
    'page';
  type ResponseMode =
    'okta_post_message' |
    'fragment' |
    'query' |
    'form_post';
  type ResponseType =
    'code' |
    'token' |
    'id_token';
  type Scope =
    'openid' |
    'email' |
    'profile' |
    'address' |
    'phone';

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

  type SimpleCallback = () => void;

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

  type ColorKey = 'brand';

  type LinkTarget =
    '_blank' |
    '_self' |
    '_parent' |
    '_top';
  interface Link {
    text: string;
    href: string;
    target?: LinkTarget;
  }

  interface CustomButton {
    click: SimpleCallback;
    title?: string;
    i18nKey?: string;
    className?: string;
  }

  interface FieldError {
    errorSummary: string;
    reason?: string;
    location?: string;
    locationType?: string;
    domain?: string;
  }

  interface Error {
    errorSummary: string;
    errorCode?: string;
    errorId?: string;
    errorLink?: string;
    errorCauses?: Array<FieldError>;
  }

  type Feature =
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
  type Event =
    'ready' |
    'afterError' |
    'afterRender';
  interface EventContext {
    controller: string;
  }
  interface EventData {
    page: string;
  }
  interface EventError {
    name: string;
    message: string;
    statusCode?: number;
    xhr?: ErrorXHR;
  }
  interface ErrorXHR {
    status: number;
    responseType: 'json';
    responseText: string;
    responseJSON: Error;
  }
  type EventCallback = (context: EventContext) => void;
  type EventCallbackWithError = (context: EventContext, error: EventError) => void;

  // Registration
  namespace Registration {
    type FieldType =
      'string' |
      'number' |
      'integer' |
      'boolean' |
      // string with format
      'uri' |
      'email' |
      'country_code' |
      'language_code' |
      'locale' |
      'timezone' |
      // arrays
      'arrayofstring' |
      'arrayofnumber' |
      'arrayofinteger';

    interface StringConstraint {
      minLength?: number;
      maxLength?: number;
    }
    interface NumberConstraint {
      minimum?: number;
      maximum?: number;
    }
    interface WithDefault<T> {
      default?: T;
    }
    interface EnumConstraint<T> {
      enum?: Array<T | null>;
      oneOf?: Array<{const: T | null; title: string}>;
    }
    interface PasswordConstraints {
      allOf?: Array<PasswordConstraint>;
    }
    interface PasswordConstraint {
      description?: string;
      format?: string;
    }

    interface FieldBasic {
      type: FieldType;
      title?: string;
      description?: string;
    }
    interface FieldString extends FieldBasic, StringConstraint, EnumConstraint<string>, WithDefault<string> {
      type: 'string';
    }
    interface FieldStringWithFormat extends FieldBasic, WithDefault<string> {
      type:
        'uri' |
        'email';
    }
    interface FieldStringWithFormatAndEnum extends FieldBasic, EnumConstraint<string>, WithDefault<string> {
      type:
        'country_code' |
        'language_code' |
        'locale' |
        'timezone';
    }
    interface FieldPassword extends FieldBasic, StringConstraint, PasswordConstraints, WithDefault<string> {
      type: 'string';
    }
    interface FieldNumber extends FieldBasic, NumberConstraint, EnumConstraint<number>, WithDefault<number> {
      type: 'number' | 'integer';
    }
    interface FieldBoolean extends FieldBasic, EnumConstraint<boolean>, WithDefault<boolean> {
      type: 'boolean';
    }
    interface FieldArray extends FieldBasic {
      type: 'arrayofstring' | 'arrayofinteger' | 'arrayofnumber';
    }

    type Field =
      FieldString |
      FieldStringWithFormat |
      FieldStringWithFormatAndEnum |
      FieldPassword |
      FieldNumber |
      FieldBoolean |
      FieldArray;

    interface Schema {
      lastUpdate: number;
      policyId: string;
      profileSchema: {
        properties: {
          [key: string]: Field;
        };
        required: Array<string>;
        fieldOrder: Array<string>;
      };
    }

    type FieldValue = string | boolean | number | Array<string | number> | null;

    interface Data {
      [key: string]: FieldValue;
    }

    interface Callbacks {
      click?: SimpleCallback;
      parseSchema?: (
        schema: Schema,
        onSuccess: (schema: Schema) => void,
        onFailure: (error: Error) => void
      ) => void;
      preSubmit?: (
        postData: Data,
        onSuccess: (schema: Data) => void,
        onFailure: (error: Error) => void
      ) => void;
      postSubmit?: (
        response: string,
        onSuccess: (response: string) => void,
        onFailure: (error: Error) => void
      ) => void;
    }
  }

  // Render options
  interface ShowSignInToGetTokensOptions {
    el?: string;
    clientId?: string;
    redirectUri?: string;
    scopes?: Array<Scope>;
  }
  interface ShowSignInAndRedirectOptions {
    el?: string;
    clientId?: string;
    redirectUri?: string;
  }
  interface RenderElOptions {
    el?: string;
  }

  // Render result
  type RenderStatus =
    'FORGOT_PASSWORD_EMAIL_SENT' |
     'ACTIVATION_EMAIL_SENT' |
     'REGISTRATION_COMPLETE' |
     'UNLOCK_ACCOUNT_EMAIL_SENT' |
     'SUCCESS';
  type RenderType =
    'SESSION_STEP_UP' |
    'SESSION_SSO';
  interface RenderResultBasic {
    status: RenderStatus;
  }
  interface RenderResultRegistration extends RenderResultBasic {
    status: 'REGISTRATION_COMPLETE';
    activationToken: string;
  }
  interface RenderResultEmailSent extends RenderResultBasic {
    status:
      'FORGOT_PASSWORD_EMAIL_SENT' |
      'ACTIVATION_EMAIL_SENT' |
      'UNLOCK_ACCOUNT_EMAIL_SENT';
    username: string;
  }
  interface RenderResultSuccessBasic extends RenderResultBasic {
    status: 'SUCCESS';
  }
  interface RenderResultSuccessOIDC extends RenderResultSuccessBasic {
    tokens?: Tokens;
    code?: string;
    state?: string;
  }
  interface RenderResultSuccessNonIDCBasic extends RenderResultSuccessBasic {
    type?: RenderType;
    user?: User;
  }
  interface RenderResultSuccessNonIDCStepUp extends RenderResultSuccessNonIDCBasic {
    // type: 'SESSION_STEP_UP'
    stepUp?: {
      url: string;
      finish: SimpleCallback;
    };
  }
  interface RenderResultSuccessNonIDCRedirect extends RenderResultSuccessNonIDCBasic {
    next?: SimpleCallback;
  }
  interface RenderResultSuccessNonIDCSession extends RenderResultSuccessNonIDCBasic {
    // type: 'SESSION_SSO';
    session?: {
      token: string;
      setCookieAndRedirect: (redirectUrl: string) => void;
    };
  }
  type RenderResultSuccessNonIDC =
    RenderResultSuccessNonIDCStepUp &
    RenderResultSuccessNonIDCRedirect &
    RenderResultSuccessNonIDCSession;
  type RenderResultSuccess =
    RenderResultSuccessOIDC &
    RenderResultSuccessNonIDC;
  type RenderResult =
    RenderResultSuccess |
    RenderResultEmailSent |
    RenderResultRegistration;
  interface User {
    id: string;
    passwordChanged: string;
    profile: Profile;
  }
  interface Profile {
    firstName: string;
    lastName: string;
    locale: string;
    login: string;
    timeZone: string;
  }

  interface RenderError {
    name: 'CONFIG_ERROR' | 'UNSUPPORTED_BROWSER_ERROR' | string;
    message: string;
  }
}

export default OktaSignIn;
