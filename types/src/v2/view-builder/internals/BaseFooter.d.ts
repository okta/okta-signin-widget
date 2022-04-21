declare var _default: any;
export default _default;
/**
 * When `href` is present, the Link behaviors as normal link (anchor element).
 * When `actionPath` is present, the Link behaviors as link button
 *   on which user clicks, will trigger the action `actionPath`.
 * When `formName` is present, the link behaviors as link button
 *   on which user clicks, will submit a remediation form.
 */
export type Link = {
    label: string;
    name: string;
    href?: string | undefined;
    actionPath?: string | undefined;
    formName?: string | undefined;
};
//# sourceMappingURL=BaseFooter.d.ts.map