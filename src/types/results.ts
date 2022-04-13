import { Tokens } from "@okta/okta-auth-js";

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
export interface RenderResultSuccessNonOIDCBasic extends RenderResultSuccessBasic {
  type?: RenderType;
  user?: User;
}

export type SimpleCallback = () => void;
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

export interface RenderError {
  name: 'CONFIG_ERROR' | 'UNSUPPORTED_BROWSER_ERROR' | string;
  message: string;
}
