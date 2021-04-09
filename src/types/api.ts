import { OktaAuth, OktaAuthOptions, Tokens } from '@okta/okta-auth-js';
import { EventCallback, EventCallbackWithError, WidgetOptions } from './WidgetOptions';
export interface HooksAPI {
  before(eventName, hookFn): void;
  after(eventName, hookFn): void;
}
export interface RouterEventsAPI {
  on(event: 'ready', callback: EventCallback): void;
  on(event: 'afterError', callback: EventCallbackWithError): void;
  on(event: 'afterRender', callback: EventCallback): void;

  off(event?: 'ready', callback?: EventCallback): void;
  off(event?: 'afterError', callback?: EventCallbackWithError): void;
  off(event?: 'afterRender', callback?: EventCallback): void;
}

export type RenderSuccessCallback = (res: RenderResult) => void;
export type RenderErrorCallback = (err: RenderError) => void;
export interface OktaSignInAPI extends HooksAPI, RouterEventsAPI {
  authClient: OktaAuth;
  show(): void;
  hide(): void;
  remove(): void;
  showSignIn(options): Promise<RenderResult>;
  showSignInToGetTokens(options: RenderOptions): Promise<Tokens>;
  showSignInAndRedirect(options: RenderOptions): Promise<void>;
  renderEl(
    options: RenderOptions,
    success?: RenderSuccessCallback,
    error?: RenderErrorCallback
  ): Promise<RenderResult>;

  getUser(): void
}
export interface OktaSignInConstructor {
  new(options: WidgetOptions): OktaSignInAPI;
}

export type SimpleCallback = () => void;

// Auth params

export interface AuthParams extends OktaAuthOptions {
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

// Render options
export interface RenderOptions {
  el?: string;
  clientId?: string;
  redirectUri?: string;
  scopes?: Array<Scope>;
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
export interface RenderResultBasic {
  status: RenderStatus;
}
export interface RenderResultRegistration extends RenderResultBasic {
  status: 'REGISTRATION_COMPLETE';
  activationToken: string;
}
export interface RenderResultEmailSent extends RenderResultBasic {
  status:
    'FORGOT_PASSWORD_EMAIL_SENT' |
    'ACTIVATION_EMAIL_SENT' |
    'UNLOCK_ACCOUNT_EMAIL_SENT';
  username: string;
}
export interface RenderResultSuccessBasic extends RenderResultBasic {
  status: 'SUCCESS';
}
export interface RenderResultSuccessOIDC extends RenderResultSuccessBasic {
  tokens?: Tokens;
  code?: string;
  state?: string;
}
export interface RenderResultSuccessNonOIDCBasic extends RenderResultSuccessBasic {
  type?: RenderType;
  user?: User;
}
export interface RenderResultSuccessNonOIDCStepUp extends RenderResultSuccessNonOIDCBasic {
  // type: 'SESSION_STEP_UP'
  stepUp?: {
    url: string;
    finish: SimpleCallback;
  };
}
export interface RenderResultSuccessNonOIDCRedirect extends RenderResultSuccessNonOIDCBasic {
  next?: SimpleCallback;
}
export interface RenderResultSuccessNonOIDCSession extends RenderResultSuccessNonOIDCBasic {
  // type: 'SESSION_SSO';
  session?: {
    token: string;
    setCookieAndRedirect: (redirectUrl: string) => void;
  };
}
export type RenderResultSuccessNonIDC =
  RenderResultSuccessNonOIDCStepUp &
  RenderResultSuccessNonOIDCRedirect &
  RenderResultSuccessNonOIDCSession;

export type RenderResultSuccess =
  RenderResultSuccessOIDC &
  RenderResultSuccessNonIDC;
  
export type RenderResult =
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

export interface RenderError {
  name: 'CONFIG_ERROR' | 'UNSUPPORTED_BROWSER_ERROR' | string;
  message: string;
}
