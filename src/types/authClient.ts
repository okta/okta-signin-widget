import { OAuthStorageManagerInterface, OktaAuthConstructor, OktaAuthOAuthInterface, OktaAuthOAuthOptions, PKCETransactionMeta } from "@okta/okta-auth-js";

// okta-auth-js supports a mixin pattern that allows us to compose a custom version containing only the code we need
// define types to represent the widget's version of an AuthJS client

export type WidgetStorageManagerInterface = OAuthStorageManagerInterface<PKCETransactionMeta>;
export type WidgetOktaAuthOptions = OktaAuthOAuthOptions;
export type WidgetOktaAuthInterface = OktaAuthOAuthInterface<PKCETransactionMeta, WidgetStorageManagerInterface, WidgetOktaAuthOptions>;
export interface WidgetOktaAuthConstructor extends OktaAuthConstructor<WidgetOktaAuthInterface>
{
  new (...args: any[]): WidgetOktaAuthInterface;
}
