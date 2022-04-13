import { InputOptions } from '../types';
export interface CreateButtonOptions {
    action?: (...any: any[]) => any;
    id?: string;
    className?: string;
    text?: string;
    type?: string;
}
declare function validateInput(options: InputOptions, model: any): void;
declare function generateInputOptions(options: InputOptions, form: any, createFn: any): InputOptions[];
export interface CreateReadFormButtonOptions {
    type: string;
    formTitle: string;
    className: string;
}
declare const _default: {
    LABEL_OPTIONS: string[];
    CONTAINER_OPTIONS: string[];
    WRAPPER_OPTIONS: string[];
    INPUT_OPTIONS: string[];
    generateInputOptions: typeof generateInputOptions;
    changeEventString: (fieldNames: any) => string;
    createReadFormButton: (options: CreateReadFormButtonOptions) => any;
    createButton: (options: CreateButtonOptions) => any;
    validateInput: typeof validateInput;
    /**
     * Applies a show-when logic on a view instance.
     * The show-when is a map of a model field name -> a boolean or a function that returns a boolean.
     * The view will toggle based on the field value.
     *
     * @param  {Okta.View} view a view instance that has a this.model attached to it
     * @param  {Object} showWhen
     */
    applyShowWhen: (view: any, showWhen: any) => void;
    applyToggleWhen: (view: any, toggleWhen: any) => void;
};
export default _default;
