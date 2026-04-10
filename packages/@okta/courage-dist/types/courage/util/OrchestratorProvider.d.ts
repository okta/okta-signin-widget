export declare type HttpMethod = string;
export declare type HeaderRecord<T extends string> = Record<T, string>;
export declare enum AuthorizationHeaderTypes {}
export declare type AuthParams = {
    acrValues?: string;
    maxAge?: number;
};
export declare const getOidcRequestHeaders: (scopes: string[], url: string, method: HttpMethod, authParams?: AuthParams) => Promise<Partial<HeaderRecord<"dpop" | "authorization">>>;
