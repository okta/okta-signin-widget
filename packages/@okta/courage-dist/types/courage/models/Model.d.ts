import { FrameworkModelInstance, FrameworkModelConstructor } from '../framework/Model';
export interface ModelInstance extends FrameworkModelInstance {
    secureJSON: boolean;
}
export interface ModelConstructor<I extends ModelInstance = ModelInstance> extends FrameworkModelConstructor {
    new (attributes?: any, options?: any): I;
    extend<S = ModelConstructor>(properties: any, classProperties?: any): S;
}
/**
 * Wrapper around the more generic {@link src/framework/Model} that
 * contains Okta-specific logic.
 * @class module:Okta.Model
 * @extends src/framework/Model
 */
declare const constructor: ModelConstructor;
export default constructor;
