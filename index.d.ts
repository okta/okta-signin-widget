declare module '@okta/okta-signin-widget'

export declare class OktaSignIn implements OktaSignIn {
    constructor(configuration: OktaSignInConfig);

    renderEl(configuration: { el: string }): void;
    remove(): void;

    session: {
        get: (callback: (repsonse: any) => void) => void;
    };
}

export type OktaSignInConfigAuthParamsResponseMode = 'okta_post_message' | 'fragment' | 'query' | 'form_post';

export interface OktaSignInConfigAuthParams {
    pkce?: boolean,
    responseMode?: OktaSignInConfigAuthParamsResponseMode,
    issuer?: string;
    display?: 'page';
    scopes?: string[];
    responseType?: string[];
}

interface OktaSignInConfigi18n {
    en?: {
        'primaryauth.username.placeholder'?: string;
        'primaryauth.username.tooltip'?: string;
        'primaryauth.title'?: string;
        'error.username.required'?: string;
        'error.password.required'?: string;
    };
}

interface OktaSignInConfig {
    baseUrl: string;
    logo: string;
    clientId?: string;
    redirectUri?: string;
    authParams: OktaSignInConfigAuthParams;
    i18n: OktaSignInConfigi18n;
}
