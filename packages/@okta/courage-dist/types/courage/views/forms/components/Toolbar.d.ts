import BaseView from '../../BaseView';
declare type ButtonOrderEnum = 'previous' | 'save' | 'cancel';
export declare class ToolbarClass extends BaseView {
    addButton(parmas: any, options?: any): this;
    buttonOrder: ButtonOrderEnum[];
    __getButtonOrder(options: any): ButtonOrderEnum[];
}
declare const _default: typeof ToolbarClass;
export default _default;
