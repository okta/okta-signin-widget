import { ButtonOptions } from "../../../../packages/@okta/courage-dist/types/CourageForSigninWidget";
declare module "../../../../packages/@okta/courage-dist/types/CourageForSigninWidget" {
    interface ButtonOptions {
        attributes?: Record<string, any> | undefined;
        className?: string | undefined;
    }
}
declare const isTextOverflowing: (text: any, maxWidth: any) => boolean;
declare const create: (uiSchemaObj: any) => any;
/**
 * Example of `redirect-idp` remediation.
 * {
 *   "name": "redirect-idp",
 *   "type": "MICROSOFT",
 *   "idp": {
 *      "id": "0oa2szc1K1YPgz1pe0g4",
 *      "name": "Microsoft IDP"
 *    },
 *   "href": "http://localhost:3000/sso/idps/0oa2szc1K1YPgz1pe0g4?stateToken=BB...AA",
 *   "method": "GET"
 * }
 *
 */
declare const createIdpButtons: ({ settings, appState }: {
    settings: any;
    appState: any;
}) => (ButtonOptions | {
    attributes: {
        'data-se': string;
    };
    className: string;
    title: any;
    click: (e: any) => void;
})[];
declare const createCustomButtons: (settings: any) => any;
declare const addCustomButton: (customButtonSettings: any) => any;
export { create, createIdpButtons, createCustomButtons, addCustomButton, isTextOverflowing };
//# sourceMappingURL=FormInputFactory.d.ts.map