import Backbone from 'backbone';
import { BaseInputClass } from './BaseInput';
export interface BaseInputOptions<TModel extends Backbone.Model = Backbone.Model> extends Backbone.ViewOptions<TModel> {
    name?: string | string[];
    inputId?: any;
    type?: any;
    input?: InputOptions | InputOptions[] | BaseInputClass;
    placeholder?: any;
    label?: any;
    readOnly?: any;
    read?: any;
    disabled?: any;
    readModeString?: any;
    options?: any;
    deps?: any;
    from?: any;
    to?: any;
    autoRender?: any;
    inlineValidation?: any;
    validateOnlyIfDirty?: any;
    ariaLabel?: any;
    params?: any;
    autoComplete?: any;
    errorField?: any;
}
export interface LabelOptions extends BaseInputOptions {
    sublabel?: any;
    tooltip?: string;
    group?: string;
}
export interface ContainerOptions extends BaseInputOptions {
    wide?: any;
    multi?: number | boolean;
    'label-top'?: any;
    explain?: any;
    'explain-top'?: any;
    customExplain?: any;
    autoRender?: boolean;
    multirowError?: any;
}
export interface WrapperOptions extends BaseInputOptions {
    'label-top'?: number;
    readOnly?: boolean;
    events?: any;
    initialize?: any;
    showWhen?: any;
    bindings?: any;
    render?: any;
    className?: any;
    'data-se'?: any;
    toggleWhen?: any;
    group?: any;
}
export interface ButtonOptions extends BaseInputOptions {
    click?: (...any: any[]) => any;
    href?: string;
    title?: string;
    icon?: string;
}
export declare type InputOptions = LabelOptions & BaseInputOptions & ButtonOptions;
