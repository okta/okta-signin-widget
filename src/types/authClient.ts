import { OAuthStorageManagerInterface, OktaAuthConstructor, OktaAuthOAuthInterface, OktaAuthOAuthOptions, PKCETransactionMeta } from "@okta/okta-auth-js";

export type WidgetStorageManagerInterface = OAuthStorageManagerInterface<PKCETransactionMeta>;
export type WidgetOktaAuthOptions = OktaAuthOAuthOptions;
export type WidgetOktaAuthInterface<O extends WidgetOktaAuthOptions = WidgetOktaAuthOptions> = OktaAuthOAuthInterface<PKCETransactionMeta, WidgetStorageManagerInterface, O>;
export interface WidgetOktaAuthConstructor<O extends WidgetOktaAuthOptions = WidgetOktaAuthOptions, I extends WidgetOktaAuthInterface<O> = WidgetOktaAuthInterface<O>>
  extends OktaAuthConstructor
{
  new (...args: any[]): I;
}
