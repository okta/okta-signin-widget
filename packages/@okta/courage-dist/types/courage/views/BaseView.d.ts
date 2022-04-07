import View, { FrameworkViewOptions } from '../framework/View';
export interface BaseViewOptions extends FrameworkViewOptions {
}
export interface ConfirmOption {
    title: string;
    content: string;
    save?: () => void;
    ok?: () => void;
    cancel?: () => void;
}
export declare class BaseViewClass extends View {
    constructor(options?: BaseViewOptions, ...rest: any[]);
    empty(): this;
    broadcast(...args: any[]): this;
    listen(name: any, fn: any): this;
    notify(level: any, message: any, options: any): this;
    confirm(subtitle: string, okfn: any): this;
    confirm(confirmOption: ConfirmOption): this;
    confirm(title: any, message: any, okfn: any, cancelfn: any): this;
    alert(params: any): this;
    module?: {
        id: string;
    };
    decorate(TargetView: any): TargetView is BaseViewClass;
}
declare const _default: typeof BaseViewClass;
/**
 * See {@link src/framework/View} for more detail and examples from the base class.
 * @class module:Okta.View
 * @extends src/framework/View
 */
/** @lends module:Okta.View.prototype */
export default _default;
