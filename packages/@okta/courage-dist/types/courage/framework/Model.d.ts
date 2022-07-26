/// <reference types="jquery" />
import Backbone from 'backbone';
export interface ValidationMessage {
    message: string;
    passed: boolean;
}
export interface ModelPropertySchema {
    name?: string;
    type?: string;
    required?: boolean;
    value?: any;
    validate?: (value: any) => any;
    values?: any[];
    minLength?: number;
    maxLength?: number;
    uniqueItems?: boolean;
    items?: ModelProperty;
    maxItems?: number;
    minItems?: number;
    deps?: string[];
    fn?: (...values: any[]) => any;
    cache?: boolean;
}
export declare function isModelPropertySchema(obj: any): obj is ModelPropertySchema;
export declare type ModelProperty = ModelPropertySchema | string | [string, boolean] | [string, boolean, any?];
export interface ModelSchema {
    computedProperties?: Record<string, ModelProperty>;
    props?: Record<string, ModelProperty>;
    derived?: Record<string, ModelProperty>;
    local?: Record<string, ModelProperty>;
}
export declare type ModelSaveOptions<T> = Backbone.ModelSaveOptions & T & {
    [key: string]: any;
};
export declare class FrameworkModelClass<T extends Backbone.ObjectHash = any> extends Backbone.Model {
    static isCourageModel: true;
    static ERROR_BLANK: 'model.validation.field.blank';
    static ERROR_WRONG_TYPE: 'model.validation.field.wrong.type';
    static ERROR_NOT_ALLOWED: 'model.validation.field.value.not.allowed';
    static ERROR_INVALID: 'model.validation.field.invalid';
    static ERROR_IARRAY_UNIQUE: 'model.validation.field.array.unique';
    static ERROR_INVALID_FORMAT_EMAIL: 'model.validation.field.invalid.format.email';
    static ERROR_INVALID_FORMAT_URI: 'model.validation.field.invalid.format.uri';
    static ERROR_INVALID_FORMAT_IPV4: 'model.validation.field.invalid.format.ipv4';
    static ERROR_INVALID_FORMAT_HOSTNAME: 'model.validation.field.invalid.format.hostname';
    static ERROR_STRING_STRING_MIN_LENGTH: 'model.validation.field.string.minLength';
    static ERROR_STRING_STRING_MAX_LENGTH: 'model.validation.field.string.maxLength';
    options: Record<string, any>;
    computedProperties?: Record<string, ModelProperty>;
    props?: Record<string, ModelProperty>;
    derived?: Record<string, ModelProperty>;
    local?: Record<string, ModelProperty>;
    validate(): any;
    validateField(key: any): any;
    allows(key: any): any;
    getPropertySchema(propName: any): ModelPropertySchema | null;
    reset(options: any): any;
    isSynced(): boolean;
    flat?: boolean;
    save(attributes?: Partial<T> | null, options?: ModelSaveOptions<T>): JQueryXHR;
    save(key: string, value: any, options?: ModelSaveOptions<T>): JQueryXHR;
    _validateSchema(): any;
    __getDerivedValue(name: any): any;
}
/**
   * Archer.Model is a standard [Backbone.Model](http://backbonejs.org/#Model) with a few additions:
   *
   * - {@link src/framework/Model#derived Derived properties}
   * - {@link src/framework/Model#props Built in schema validation}
   * - {@link src/framework/Model#local Private properties (with schema validation)}
   * - {@link src/framework/Model#flat Flattening of nested objects}
   *
   * Both derived and private properties are filtered out when sending the data to the server.
   *
   * See [Backbone.Model](http://backbonejs.org/#Model-constructor).
   *
   * @class src/framework/Model
   * @extends external:Backbone.Model
   * @param {Object} [attributes] - Initial model attributes (data)
   * @param {Object} [options] - Options hash
   * @example
   * var Person = Archer.Model.extend({
   *   props: {
   *     'fname': 'string',
   *     'lname': 'string'
   *   },
   *   local: {
   *     isLoggedIn: 'boolean'
   *   },
   *   derived: {
   *     name: {
   *       deps: ['fname', 'lname'],
   *       fn: function (fname, lname) {
   *         return fname + ' ' + lname;
   *       }
   *     }
   *   }
   * });
   * var model = new Person({fname: 'Joe', lname: 'Doe'});
   * model.get('name'); //=> "Joe Doe"
   * model.toJSON(); //=> {fname: 'Joe', lname: 'Doe'}
   *
   * model.set('isLoggedIn', true);
   * model.get('isLoggedIn'); //=> true
   * model.toJSON(); //=> {fname: 'Joe', lname: 'Doe'}
   */
declare let Model: typeof FrameworkModelClass;
export default Model;
