import { OktaAuth, OktaAuthOptions } from '@okta/okta-auth-js';
import { SimpleCallback, RenderResult, RenderError } from './results';
import { RegistrationOptions } from './registration';
export interface WidgetOptions extends Partial<Pick<OktaAuthOptions, 'issuer' | 'clientId' | 'redirectUri' | 'state' | 'scopes' | 'codeChallenge' | 'codeChallengeMethod' | 'flow'>> {
    el?: string;
    oAuthTimeout?: number;
    authParams?: AuthParams;
    authClient?: OktaAuth;
    baseUrl?: string;
    logo?: string;
    logoText?: string;
    helpSupportNumber?: string;
    brandName?: string;
    username?: string;
    transformUsername?: (username: string, operation: UserOperation) => string;
    processCreds?: (creds: Creds, callback?: SimpleCallback) => void;
    language?: LanguageCode | LanguageCallback | string;
    i18n?: any;
    assets?: {
        baseUrl?: string;
        rewrite?: (assetPath: string) => string;
    };
    colors?: any;
    helpLinks?: {
        help?: string;
        forgotPassword?: string;
        factorPage?: Link;
        unlock?: string;
        custom?: Array<Link>;
    };
    signOutLink?: string;
    customButtons?: Array<CustomButton>;
    registration?: RegistrationOptions;
    policyId?: string;
    features?: any;
    idps?: Array<SocialIdp | CustomIdp>;
    idpDisplay?: IdpDisplay;
    idpDiscovery?: {
        requestContext?: string;
    };
    piv?: Piv;
    recoveryToken?: string;
    stateToken?: string;
    relayState?: string;
    globalSuccessFn?: (res: RenderResult) => void;
    globalErrorFn?: (res: RenderError) => void;
    apiVersion?: string;
    consent?: {
        cancel?: SimpleCallback;
    };
    useInteractionCodeFlow?: boolean;
    hooks?: HooksOptions;
    proxyIdxResponse?: any;
}
export interface AuthParams extends OktaAuthOptions {
    display?: Display;
    nonce?: string;
    authScheme?: string;
}
declare type Display = 'popup' | 'page';
export declare type RenderOptions = Omit<WidgetOptions, 'authClient' | 'hooks'>;
interface SocialIdp {
    type: string;
    id: string;
}
interface CustomIdp {
    text: string;
    id: string;
    className?: string;
}
declare type IdpDisplay = 'PRIMARY' | 'SECONDARY';
interface Piv {
    certAuthUrl: string;
    text?: string;
    className?: string;
    isCustomDomain?: boolean;
}
declare type UserOperation = 'PRIMARY_AUTH' | 'FORGOT_PASSWORD' | 'UNLOCK_ACCOUNT';
interface Creds {
    username: string;
    password: string;
}
export declare type LanguageCode = 'cs' | // Czech
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
'zh-TW';
export declare type LanguageCallback = (supportedLanguages: Array<LanguageCode>, userLanguages: Array<string>) => LanguageCode;
export declare type ColorKey = 'brand';
export declare type LinkTarget = '_blank' | '_self' | '_parent' | '_top';
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
export declare type Feature = 'router' | 'securityImage' | 'rememberMe' | 'autoPush' | 'smsRecovery' | 'callRecovery' | 'emailRecovery' | 'webauthn' | 'selfServiceUnlock' | 'multiOptionalFactorEnroll' | 'deviceFingerprinting' | 'hideSignOutLinkInMFA' | 'hideBackToSignInForReset' | 'customExpiredPassword' | 'registration' | 'idpDiscovery' | 'passwordlessAuth' | 'showPasswordToggleOnSignInPage' | 'trackTypingPattern' | 'redirectByFormSubmit' | 'useDeviceFingerprintForSecurityImage' | 'showPasswordRequirementsAsHtmlList' | 'mfaOnlyFlow';
export declare type HookFunction = () => Promise<void>;
export interface HookDefinition {
    before?: HookFunction[];
    after?: HookFunction[];
}
export interface HooksOptions {
    [name: string]: HookDefinition;
}
export {};
//# sourceMappingURL=options.d.ts.map