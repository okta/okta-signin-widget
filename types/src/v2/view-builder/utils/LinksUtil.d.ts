export function getSwitchAuthenticatorLink(appState: any): {
    type: string;
    label: any;
    name: string;
    formName: string;
}[];
export function getForgotPasswordLink(appState: any, settings: any): {
    href: any;
    label: any;
    name: string;
}[] | ({
    type: string;
    label: any;
    name: string;
} & {
    actionPath: string;
})[];
export function goBackLink(appState: any): {
    type: string;
    label: any;
    name: string;
    formName: string;
}[];
export function getSignUpLink(appState: any, settings: any): {
    type: string;
    label: any;
    name: string;
}[];
export function getSignOutLink(settings: any, options?: {}): {
    label: any;
    name: string;
    href: any;
}[] | {
    actionPath: string;
    label: any;
    name: string;
    type: string;
}[];
export function getBackToSignInLink(settings: any): {
    type: string;
    label: any;
    name: string;
    href: any;
}[];
export function getSkipSetupLink(appState: any, linkName: any): {
    type: string;
    label: any;
    name: string;
    actionPath: string;
}[];
export function getReloadPageButtonLink(): {
    type: string;
    label: any;
    name: string;
    href: Location;
    className: string;
}[];
export function getFactorPageCustomLink(appState: any, settings: any): {
    type: string;
    label: any;
    name: string;
    href: any;
    target: string;
}[];
//# sourceMappingURL=LinksUtil.d.ts.map