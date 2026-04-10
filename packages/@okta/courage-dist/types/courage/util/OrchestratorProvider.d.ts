import { HttpMethod, AuthorizationHeaderTypes } from '@okta/ui-libraries-oidc-auth-headers';
export { AuthorizationHeaderTypes };
export declare type AuthParams = {
    acrValues?: string;
    maxAge?: number;
};
export declare const getOidcRequestHeaders: (scopes: string[], url: string, method: HttpMethod, authParams?: AuthParams) => Promise<Partial<import("@okta/ui-libraries-oidc-auth-headers").HeaderRecord<"dpop" | "authorization">>>;
