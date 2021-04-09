import Backbone from 'backbone';
import { SettingsModelInstance } from './SettingsModel';
import { BaseControllerInstance } from './BaseController';
export interface BaseRouterOptions extends Backbone.HistoryOptions {
    el?: HTMLElement | string | JQuery.PlainObject;
}
export interface BaseRouterPublic {
    listen(name: any, fn: any): Backbone.View;
    start(): any;
    unload(): any;
    render(Controller: any, options: any): any;
}
export interface BaseRouterInstance extends BaseRouterPublic, Backbone.Router {
    el: Backbone._Result<string | HTMLElement | JQuery.PlainObject>;
    root: Backbone._Result<string>;
    settings: SettingsModelInstance;
    controller: BaseControllerInstance;
}
export interface BaseRouterConstructor {
    new (options: any): BaseRouterInstance;
    extend(properties: any, classProperties?: any): any;
}
declare const constructor: BaseRouterConstructor;
export default constructor;
