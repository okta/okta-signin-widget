/// <reference types="backbone" />
import { SettingsModelInstance } from './SettingsModel';
import StateMachine from './StateMachine';
import { BaseViewConstructor, BaseViewInstance } from '../views/BaseView';
export interface BaseControllerOptions {
    state?: typeof StateMachine;
    settings?: SettingsModelInstance;
}
export interface BaseControllerPublic {
    state: typeof StateMachine | Record<string, never>;
    View: BaseViewConstructor;
    toJSON(options: any): any;
}
export interface BaseControllerInstance extends BaseViewInstance {
    root: Backbone._Result<string>;
    settings: SettingsModelInstance;
}
export interface BaseControllerConstructor<I extends BaseControllerInstance = BaseControllerInstance> extends Backbone.View {
    (attributes?: any, options?: any): void;
    new (attributes?: any, options?: any): I;
    extend<S = BaseControllerConstructor>(properties: any, classProperties?: any): S;
}
declare const _default: BaseControllerConstructor<BaseControllerInstance>;
export default _default;
