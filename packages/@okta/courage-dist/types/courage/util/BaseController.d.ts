/// <reference types="backbone" />
import { SettingsModelClass } from './SettingsModel';
import StateMachine from './StateMachine';
import BaseView, { BaseViewOptions } from '../views/BaseView';
export declare type JSONValue = string | number | boolean | null | {
    [key: string]: JSONValue;
} | Array<JSONValue>;
export interface BaseControllerOptions extends BaseViewOptions {
    state?: typeof StateMachine;
    settings?: SettingsModelClass;
}
export declare class BaseControllerClass extends BaseView {
    constructor(options: any);
    root: Backbone._Result<string>;
    View: any;
    toJSON(options: any): JSONValue;
}
declare const _default: typeof BaseControllerClass;
/**
 * A Controller is our application control flow component.
 *
 * Typically it will:
 * - Initialize the models, controller and main views
 * - Listen to events
 * - Create, read, update and delete models
 * - Create modal dialogs, confirmation dialogs and alert dialogs
 * - Control the application flow
 *
 * The constructor is responsible for:
 * - Create the application state object
 * - Assign or creates the application settings object
 * - Create an instance of the main view with the relevant parameters
 *
 * See:
 * [Hello World Tutorial](https://github.com/okta/courage/wiki/Hello-World),
 * [Test Spec](https://github.com/okta/okta-ui/blob/master/packages/courage/test/spec/util/BaseController_spec.js)
 *
 * @class module:Okta.Controller
 * @param {Object} options Options Hash
 * @param {SettingsModel} [options.settings] Application Settings Model
 * @param {String} options.el a jQuery selector string stating where to attach the controller in the DOM
 */
export default _default;
