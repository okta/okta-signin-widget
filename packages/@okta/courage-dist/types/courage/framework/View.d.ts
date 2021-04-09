/// <reference types="underscore" />
import Backbone from 'backbone';
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
}
export declare type ChildDefinition = [FrameworkViewConstructor, string?, Record<string, any>?];
export interface FrameworkViewPublic {
    add(template: string, selector?: string): any;
    add(view: any, selector?: string): any;
    add(view: any, options: Record<string, any>): any;
    add(view: any, selector: any, bubble?: any, prepend?: any, extraOptions?: any): any;
    children: Backbone._Result<ChildDefinition[]>;
    autoRender: boolean;
    template: string | CompiledTemplate;
    rendered(): boolean;
    preRender(): any;
    postRender(): any;
    getTemplateData(): Record<string, string>;
    compileTemplate(template: string): CompiledTemplate;
    renderTemplate(template: string | CompiledTemplate): any;
    removeChildren(): FrameworkViewInstance;
    unregister(view: any): any;
    getChildren(): FrameworkViewInstance[];
    at(index: number): FrameworkViewInstance;
    invoke(methodName: string): FrameworkViewInstance;
}
export interface FrameworkViewInternal extends Pick<Backbone.View, 'className' | 'remove' | 'render'> {
    constructor(options?: Record<string, any>): any;
}
export interface FrameworkViewInstance extends FrameworkViewPublic, Backbone.View, Pick<_.Underscore<FrameworkViewInstance>, 'each' | 'map' | 'reduce' | 'reduceRight' | 'find' | 'filter' | 'reject' | 'every' | 'some' | 'contains' | 'toArray' | 'size' | 'first' | 'initial' | 'rest' | 'last' | 'without' | 'indexOf' | 'shuffle' | 'lastIndexOf' | 'isEmpty' | 'chain' | 'where' | 'findWhere'> {
    options: FrameworkViewOptions;
}
export interface FrameworkViewConstructor<I extends FrameworkViewInstance = FrameworkViewInstance> extends Backbone.View {
    isCourageView: true;
    (attributes?: any, options?: any): void;
    new (attributes?: any, options?: any): I;
    extend<S = FrameworkViewConstructor>(properties: any, classProperties?: any): S;
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
declare let View: FrameworkViewConstructor;
export default View;
