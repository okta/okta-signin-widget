export default Util;
declare namespace Util {
    function transformErrorXHR(xhr: any): any;
    function toLower(strings: any): any[];
    function expandLanguages(languages: any): any[];
    function callAfterTimeout(callback: any, time: any): NodeJS.Timeout;
    function debugMessage(message: any): void;
    function logConsoleError(message: any): void;
    function triggerAfterError(controller: any, err?: {}): void;
    function redirect(url: any, win?: Window & typeof globalThis, isAppLink?: boolean): void;
    function redirectWithFormGet(url: any): void;
    function redirectWithForm(url: any, method?: string): void;
    function createInputExplain(explainKey: any, labelKey: any, bundleName: any, explainParams: any, labelParams: any): any;
    function isV1StateToken(token: any): boolean;
}
//# sourceMappingURL=Util.d.ts.map