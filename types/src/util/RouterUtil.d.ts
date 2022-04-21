export default fn;
declare namespace fn {
    function isHostBackgroundChromeTab(): boolean;
    function isDocumentVisible(): boolean;
    function createVerifyUrl(provider: any, factorType: any, factorIndex: any): any;
    function createEnrollFactorUrl(provider: any, factorType: any): any;
    function createActivateFactorUrl(provider: any, factorType: any, step: any): any;
    function createRecoveryUrl(recoveryToken: any): any;
    function createRefreshUrl(stateToken: any): any;
    function routeAfterAuthStatusChangeError(router: any, err: any): void;
    function routeAfterAuthStatusChange(router: any, res: any): void;
    function handleResponseStatus(router: any, res: any): void;
}
//# sourceMappingURL=RouterUtil.d.ts.map