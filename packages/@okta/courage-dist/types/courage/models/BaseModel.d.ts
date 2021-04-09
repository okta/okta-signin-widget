import { ModelInstance, ModelConstructor } from './Model';
export interface ComputedPropertyCallback {
    (...args: any[]): any;
}
export interface ComputedPropertyCallbackWithAttributes extends ComputedPropertyCallback {
    __attributes: any;
}
export interface BaseModelPublic {
    isSynced(): boolean;
    sanitizeAttributes(attributes: any): any;
}
export interface BaseModelInstance extends BaseModelPublic, ModelInstance {
    validate(): any;
}
export interface BaseModelStatic {
    ComputedProperty(fn: ComputedPropertyCallback): ComputedPropertyCallback;
    ComputedProperty(attributes: string[], fn: ComputedPropertyCallback): ComputedPropertyCallback;
}
export interface BaseModelConstructor extends BaseModelStatic, ModelConstructor {
    new <I extends BaseModelInstance = BaseModelInstance>(options: any): I;
    extend<S = BaseModelConstructor>(properties: any, classProperties?: any): S;
}
declare const constructor: BaseModelConstructor;
export default constructor;
