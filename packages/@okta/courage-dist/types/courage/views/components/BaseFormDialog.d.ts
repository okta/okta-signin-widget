import BaseView from '../BaseView';
import BaseForm, { BaseFormConstructor } from '../forms/BaseForm';
import { SettingsModelClass } from '../../util/SettingsModel';
import { StateMachineClass } from '../../util/StateMachine';
declare type ModalParams = {
    minWidth?: number;
    maxWidth?: number;
    focus?: boolean;
    close?: boolean;
    autoResize?: boolean;
    autoPosition?: boolean;
    [key: string]: any;
};
export interface DialogOptions {
    state?: typeof StateMachineClass;
    settings?: SettingsModelClass;
    [key: string]: any;
}
export declare class BaseFormDialogClass extends BaseView {
    constructor(options: DialogOptions);
    Form: typeof BaseForm;
    form: BaseFormConstructor;
    dialog: any;
    params?: ModalParams;
    createsFormClass(): typeof BaseForm;
    resizeModal(): void;
    addInput(options: any): any;
    addButton(): any;
    addDivider(): any;
    addSectionTitle(): any;
    clearErrors(): any;
}
declare const _default: typeof BaseFormDialogClass;
/**
 * Okta.FormDialog is a facade layer for a form that lives in a modal dialog.
 *
 * The API is proxying the {@link module:Okta.Form|Form} API for the most part.
 * It also triggers all the form events
 * It takes care of repositioning, resizing, closing the dialog on cancel, and so on.
 *
 * @class module:Okta.FormDialog
 * @extends module:Okta.View
 * @borrows module:Okta.Form#event:save as save
 * @borrows module:Okta.Form#event:saved as saved
 * @borrows module:Okta.Form#event:resize as resize
 * @borrows module:Okta.Form#event:cancel as cancel
 * @borrows module:Okta.Form#title as #title
 * @borrows module:Okta.Form#subtitle as #subtitle
 * @borrows module:Okta.Form#save as #save
 * @borrows module:Okta.Form#inputs as #inputs
 * @borrows module:Okta.Form#noCancelButton as #noCancelButton
 * @borrows module:Okta.Form#noSubmitButton as #noSubmitButton
 * @borrows module:Okta.Form#autoSave as #autoSave
 * @borrows module:Okta.ModalDialog#params as #params
 * @borrows module:Okta.Form#addInput as #addInput
 * @borrows module:Okta.Form#addButton as #addButton
 * @borrows module:Okta.Form#addDivider as #addDivider
 * @borrows module:Okta.Form#addSectionTitle as #addSectionTitle
 * @borrows module:Okta.Form#clearErrors as #clearErrors
 * @example
 * var AddUserDialog = Okta.FormDialog({
 *   autoSave: true,
 *   title: 'Add a User',
 *   inputs: [
 *     {
 *       type: 'text',
 *       name: 'fname',
 *       label: 'First Name'
 *     },
 *     {
 *       type: 'text',
 *       name: 'lname',
 *       label: 'Last Name'
 *     }
 *   ]
 * });
 *
 * // renders the modal dialog on the page
 * var dialog = new AddUserDialog({model: new MyModel()}).render();
 * this.listenTo(dialog, 'saved', function (model) {
 *   // the model is now saved
 * });
 */
export default _default;
