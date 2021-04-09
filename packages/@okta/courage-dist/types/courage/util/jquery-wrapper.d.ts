/// <reference types="jquery" />
export interface OktaJQuery extends JQuery<HTMLElement> {
    scrollParent(includeHidden?: boolean): JQuery<HTMLElement>;
}
export interface OktaJQueryStatic extends JQueryStatic {
    (selector: JQuery.Selector, context?: Element | Document | JQuery | JQuery.Selector): OktaJQuery;
    fn: OktaJQuery;
}
declare const oktaJQueryStatic: OktaJQueryStatic;
export default oktaJQueryStatic;
