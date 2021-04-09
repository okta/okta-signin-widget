import Backbone from 'backbone';
/**
 * @class BaseInput
 * @private
 * An abstract object that defines an input for {@link Okta.Form}
 *
 * BaseInputs are typically not created directly, but being passed to {@link Okta.Form#addInput}
 * @extends Okta.View
 */
interface BaseInputPublic {
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
}
export interface BaseInputInterface extends BaseInputPublic, Backbone.View {
}
export interface BaseInputConstructor {
    new (options: any): BaseInputInterface;
    extend<S = BaseInputConstructor>(properties: any, classProperties?: any): S;
}
declare const constructor: BaseInputConstructor;
export default constructor;
