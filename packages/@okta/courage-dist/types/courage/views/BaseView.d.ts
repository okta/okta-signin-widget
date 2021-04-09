import Backbone from 'backbone';
import { FrameworkViewInstance } from '../framework/View';
export interface BaseViewPublic {
    empty(): any;
    broadcast(...args: any[]): BaseViewInstance;
    listen(name: any, fn: any): BaseViewInstance;
    notify(level: any, message: any, options: any): BaseViewInstance;
    confirm(title: any, message: any, okfn: any, cancelfn: any): BaseViewInstance;
    alert(params: any): BaseViewInstance;
}
export interface BaseViewInstance extends BaseViewPublic, FrameworkViewInstance {
    module?: {
        id: string;
    };
    decorate(TargetView: any): TargetView is BaseViewConstructor;
}
export interface BaseViewConstructor<I extends BaseViewInstance = BaseViewInstance> extends Backbone.View {
    new (attributes?: any, options?: any): I;
    extend<S = BaseViewConstructor>(properties: any, classProperties?: any): S;
}
declare const _default: BaseViewConstructor<BaseViewInstance>;
/**
 * See {@link src/framework/View} for more detail and examples from the base class.
 * @class module:Okta.View
 * @extends src/framework/View
 */
/** @lends module:Okta.View.prototype */
export default _default;
