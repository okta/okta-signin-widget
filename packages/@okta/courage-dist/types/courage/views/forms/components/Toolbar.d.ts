/// <reference types="backbone" />
import { BaseViewInstance } from '../../BaseView';
export interface ToolbarPublic {
    addButton(parmas: any, options?: any): any;
    buttonOrder: string[];
}
export interface ToolbarInstance extends ToolbarPublic, BaseViewInstance {
}
export interface ToolbarConstructor<I extends ToolbarInstance = ToolbarInstance> extends Backbone.View {
    new (attributes?: any, options?: any): I;
    extend<C = ToolbarConstructor>(properties: any, classProperties?: any): C;
}
declare const _default: ToolbarConstructor<ToolbarInstance>;
export default _default;
