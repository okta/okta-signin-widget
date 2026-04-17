declare module '@okta/ui-libraries-oidc-auth-headers' {
  export type HttpMethod = string;
  export type HeaderRecord<T extends string> = Record<T, string>;
  export enum AuthorizationHeaderTypes {}
}
