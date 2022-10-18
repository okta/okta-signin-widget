/// <reference types="jquery" />
/// <reference types="jqueryui" />
/// <reference types="selectize" />
import Backbone, { _Result } from 'backbone';
import { SettingsModelClass } from '../util/SettingsModel';
import { StateMachineClass } from '../util/StateMachine';
import { FrameworkModelClass } from './Model';
declare class BackboneViewExt extends Backbone.EventsMixin implements Backbone.Events {
    static extend(properties: any, classProperties?: any): any;
    /**
     * For use with views as ES classes. If you define a preinitialize
     * method, it will be invoked when the view is first created, before any
     * instantiation logic is run
     * @see https://backbonejs.org/#View-preinitialize
     */
    preinitialize(options?: Backbone.ViewOptions<Backbone.Model>): void;
    initialize(options?: Backbone.ViewOptions<Backbone.Model>): void;
    /**
    * Events hash or a method returning the events hash that maps events/selectors to methods on your View.
    * For assigning events as object hash, do it like this: this.events = <any>{ "event:selector": callback, ... };
    * That works only if you set it in the constructor or the initialize method.
    */
    events(): Backbone.EventsHash;
    model: FrameworkModelClass;
    collection: Backbone.Collection<Backbone.Model>;
    setElement(element: HTMLElement | JQuery): this;
    id?: string;
    cid: string;
    className(): string;
    tagName: string;
    el: HTMLElement;
    $el: JQuery;
    attributes(): Record<string, any>;
    $(selector: string): JQuery;
    render(): this;
    remove(): this;
    delegateEvents(events?: _Result<Backbone.EventsHash>): this;
    delegate(eventName: string, selector: string, listener: Backbone.ViewEventListener): this;
    undelegateEvents(): this;
    undelegate(eventName: string, selector?: string, listener?: Backbone.ViewEventListener): this;
}
export interface CompiledTemplate {
    (data?: any): string;
    source?: string;
}
export interface FrameworkViewOptions {
    el?: any;
    state?: any;
    settings?: any;
    model?: any;
    collection?: any;
    selector?: string;
    bubble?: boolean;
    prepend?: boolean;
    options?: Record<string, any>;
    [key: string]: any;
}
export declare type ChildDefinition = [FrameworkViewClass, string?, Record<string, any>?];
export declare class FrameworkViewClass extends BackboneViewExt {
    static isCourageView: true;
    constructor(options: FrameworkViewOptions, ...rest: any[]);
    add(template: string, selector?: string): any;
    add(view: any, selector?: string): any;
    add(view: any, options: Record<string, any>): any;
    add(view: any, selector: any, bubble?: any, prepend?: any, extraOptions?: any): any;
    options: FrameworkViewOptions;
    state: StateMachineClass | Record<string, never>;
    settings: SettingsModelClass;
    stateEvents?: Record<string, string>;
    modelEvents?: Record<string, string>;
    children: Backbone._Result<ChildDefinition[]>;
    autoRender: boolean;
    template: string | CompiledTemplate | null;
    rendered(): boolean;
    preRender(): any;
    postRender(): any;
    enable(): any;
    getTemplateData(): Record<string, string>;
    compileTemplate(template: string): CompiledTemplate;
    renderTemplate(template: string | CompiledTemplate): any;
    removeChildren(): this;
    unregister(view: any): any;
    getChildren(): this[];
    at(index: number): this;
    invoke(methodName: string): this;
    __original_initialize__: (options: FrameworkViewOptions) => void;
    __children__: FrameworkViewClass[];
    each(fn: any): any;
    map(fn: any): any;
    reduce(fn: any, initValue: any): any;
    reduceRight(fn: any, initValue: any): any;
    find(): any;
    filter(): any;
    reject(): any;
    every(): any;
    some(): any;
    contains(): any;
    toArray(): any;
    size(): any;
    first(): any;
    initial(): any;
    rest(): any;
    last(): any;
    without(): any;
    indexOf(): any;
    shuffle(): any;
    lastIndexOf(): any;
    isEmpty(): any;
    chain(): any;
    where(): any;
    findWhere(): any;
}
/**
   * A View operates on a string template, an token based template, or a model based template, with a few added hooks.
   * It provides a collection of child views, when a child view could be a View or another View.
   * Conceptually, if we were in a file system, the View is a folder, when the concrete child views are files,
   * and the child Views are sub folders.
   *
   * *Technically, when using a View as a container, it could have its own concrete logic,
   * but conceptually we like to keep it separated so a view is either a concrete view or a collection of child views.*
   *
   * In addition to the standard backbone options, we added `settings` and `state` as first class options.
   * it will automatically assign `options` to `this.options` as an instance member.
   *
   * See [Backbone.View](http://backbonejs.org/#View).
   *
   * @class src/framework/View
   * @extends external:Backbone.View
   * @param {Object} [options] options hash
   * @example
   * var DocumentView = Archer.View.extend({
   *   template: [
   *     '<header></header>',
   *     '<article></article>',
   *     '<footer></footer>'
   *   ].join(''),
   *   children: [[HeaderView, 'header'], [ContentView, 'article'], [FooterView, 'footer']]
   * });
   */
declare let View: typeof FrameworkViewClass;
export default View;
