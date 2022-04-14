/// <reference types="jquery" />
/// <reference types="jqueryui" />
/// <reference types="selectize" />
export interface OktaJQuery extends JQuery<HTMLElement> {
    scrollParent(includeHidden?: boolean): JQuery<HTMLElement>;
}
export interface OktaJQueryBrowserPlugin {
    msie: boolean;
    opera: boolean;
    chrome: boolean;
    safari: boolean;
    mozilla: boolean;
    platform: 'ipad' | 'iphone' | 'android' | 'windowsPhone';
    mac: boolean;
    versionNumber: number;
}
export interface OktaJQueryStatic extends JQueryStatic {
    (selector: JQuery.Selector, context?: Element | Document | JQuery | JQuery.Selector): OktaJQuery;
    fn: OktaJQuery;
    browser: OktaJQueryBrowserPlugin;
}
declare const oktaJQueryStatic: OktaJQueryStatic;
export default oktaJQueryStatic;
