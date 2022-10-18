import BaseView from '../BaseView';
import { _Result } from 'backbone';
declare type ButtonOrder = 'previous' | 'save' | 'cancel';
export declare class BaseFormConstructor extends BaseView {
    input: any[];
    template: any;
    read: boolean;
    readOnly: boolean;
    noButtonBar: boolean;
    noCancelButton: boolean;
    noSubmitButton: boolean;
    buttonOrder: ButtonOrder[];
    save: string | null;
    cancel: string | null;
    danger: _Result<boolean>;
    layout: _Result<string>;
    step: number;
    totalSteps: number;
    title: string | null;
    subtitle: string | null;
    autoSave: boolean;
    scrollOnError: _Result<boolean>;
    showErrors: _Result<boolean>;
    resizeSelector: string;
    getAttribute(name: any, defaultValue?: any): any;
    hasReadMode(): boolean;
    isReadOnly(): boolean;
    hasButtonBar(): boolean;
    isValid(): boolean;
    __setSavingState(): any;
    __clearSavingState(): any;
    __toggleToolbar(): any;
    __save(): any;
    __cancel(): any;
    __previous(): any;
    __applyMode(): any;
    _editMode(): any;
    parseErrorMessage(): any;
    _handleErrorScroll(): any;
    __showErrors(model: any, resp: any, showBanner: any): any;
    clearErrors(): any;
    toggle(): any;
    __addLayoutItem(): any;
    __addNonInputLayoutItem(): any;
    addButton(): any;
    addDivider(): any;
    addSectionTitle(title: any, options?: any): any;
    addInput(options: any, ...args: any[]): any;
    __createInput(): any;
    __createWrapper(): any;
    __createLabel(): any;
    _createContainer(): any;
    __saveModelState(): any;
    focus(): any;
    disable(): any;
    enable(): any;
    contentHeight(): any;
    getInputs(): any;
    __createToolbar(): any;
}
declare const _default: typeof BaseFormConstructor;
/**
 * A Form utility framework
 *
 * Okta.Form is a form that operates on one flat model
 * It exposes one main factory method, {@link module:Okta.Form#addInput|addInput}, which add inputs to the form,
 * and each input operates on one field in the model, identified by the `name` field.
 *
 * See:
 * [Basic O-Form Tutorial](https://github.com/okta/courage/wiki/Basic-O-Form)
 *
 * @class module:Okta.Form
 * @extends module:Okta.View
 * @param {Object} options options hash (See {@link module:Okta.View|View})
 * @param {Object} options.model the model this form operates on
 * @param {Boolean} [options.label-top=false] position label on top of inputs
 * @param {Boolean} [options.wide=false] Use a wide input layout for all input
 */
/**
 * Fired when the "Save" button is clicked
 * @event module:Okta.Form#save
 * @param {module:Okta.Model} model Model used in the form
 */
/**
 * Fired after the model is successfully saved - applies when {@link module:Okta.Form#autoSave|autoSave}
 * is set to true
 * @event module:Okta.Form#saved
 * @param {module:Okta.Model} model Model used in the form
 */
/**
 * Fired when the model fires an invalid event or an error event;
 * @event module:Okta.Form#error
 * @param {module:Okta.Model} model Model used in the form
 */
/**
 * Fired when the form layout is likely to be resized
 * @event module:Okta.Form#resize
 * @param {module:Okta.Model} model Model used in the form
 */
/**
 * Fired when the "Cancel" button is clicked
 * @event module:Okta.Form#cancel
 */
export default _default;
