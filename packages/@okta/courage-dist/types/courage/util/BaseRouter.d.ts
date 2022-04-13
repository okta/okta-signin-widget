/// <reference types="jquery" />
import Backbone from 'backbone';
import { SettingsModelClass } from './SettingsModel';
import { BaseControllerClass } from './BaseController';
declare class BackboneRouterExt<O = Backbone.RouterOptions> extends Backbone.EventsMixin implements Backbone.Events {
    /**
     * Do not use, prefer TypeScript's extend functionality.
     */
    static extend(properties: any, classProperties?: any): any;
    /**
     * Routes hash or a method returning the routes hash that maps URLs with parameters to methods on your Router.
     * For assigning routes as object hash, do it like this: this.routes = <any>{ "route": callback, ... };
     * That works only if you set it in the constructor or the initialize method.
     */
    routes: Backbone._Result<Backbone.RoutesHash>;
    /**
     * For use with Router as ES classes. If you define a preinitialize method,
     * it will be invoked when the Router is first created, before any
     * instantiation logic is run for the Router.
     * @see https://backbonejs.org/#Router-preinitialize
     */
    preinitialize(options?: O): void;
    constructor(options?: O);
    initialize(options?: O): void;
    route(route: string | RegExp, name: string, callback?: Backbone.RouterCallback): this;
    route(route: string | RegExp, callback: Backbone.RouterCallback): this;
    navigate(fragment: string, options?: Backbone.NavigateOptions | boolean): this;
    execute(callback: Backbone.RouterCallback, args: string[], name: string): void;
    protected _bindRoutes(): void;
    protected _routeToRegExp(route: string): RegExp;
    protected _extractParameters(route: RegExp, fragment: string): string[];
}
export interface BaseRouterOptions extends Backbone.HistoryOptions {
    el?: HTMLElement | string | JQuery.PlainObject;
}
export declare class BaseRouterClass<S = SettingsModelClass, O = BaseRouterOptions> extends BackboneRouterExt<O> {
    el: Backbone._Result<string | HTMLElement | JQuery.PlainObject>;
    root: Backbone._Result<string>;
    settings: S;
    controller: BaseControllerClass;
    listen(name: any, fn: any): Backbone.View;
    start(): any;
    unload(): any;
    render(Controller: any, options: any): any;
    _confirm(options: any): any;
    _notify(options: any): any;
}
declare const _default: typeof BaseRouterClass;
export default _default;
