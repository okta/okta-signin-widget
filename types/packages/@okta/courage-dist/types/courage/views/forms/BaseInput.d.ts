import BaseView from '../BaseView';
export declare class BaseInputClass extends BaseView {
    defaultPlaceholder: string;
    addAriaLabel(): any;
    addInlineValidation(): any;
    toModelValue(): any;
    getCalloutParent(): any;
    showCallout(calloutConfig: any, dependencyResolved: any): any;
    removeCallout(): any;
    update(): any;
    isEditMode(): boolean;
    render(): this;
    validate(): any;
    addModelListeners(): any;
    val(): any;
    focus(): any;
    defaultValue(): any;
    editMode(): any;
    readMode(): any;
    getReadModeString(): any;
    getModelValue(): any;
    toStringValue(): any;
    resize(): void;
    disable(): void;
    enable(): void;
    changeType(type: any): void;
    getNameString(): string;
    getParams(options: any): any;
    getParam(key: any, defaultValue: any): any;
    getParamOrAttribute(key: any): any;
    _isEdited: boolean;
    __getDependencyCalloutBtn(btnConfig: any): any;
    __getCalloutMsgContainer(calloutMsg: any): any;
    __evaluateCalloutObject(dependencyResolved: any, calloutTitle: any): any;
    __handleDependency(result: any, callout: any): any;
    __showInputDependencies(): any;
    __markError(): any;
    __clearError(): any;
}
declare const _default: typeof BaseInputClass;
/**
 * @class BaseInput
 * @private
 * An abstract object that defines an input for {@link Okta.Form}
 *
 * BaseInputs are typically not created directly, but being passed to {@link Okta.Form#addInput}
 * @extends Okta.View
 */
export default _default;
