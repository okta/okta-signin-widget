import Model from './Model';
export interface ComputedPropertyCallback {
    (...args: any[]): any;
}
export interface ComputedPropertyCallbackWithAttributes extends ComputedPropertyCallback {
    __attributes: any;
}
export declare class BaseModelClass extends Model {
    static ComputedProperty(fn: ComputedPropertyCallback): ComputedPropertyCallback;
    static ComputedProperty(attributes: string[], fn: ComputedPropertyCallback): ComputedPropertyCallback;
    constructor(attr?: any, options?: any);
    _setSynced(newModel: any): any;
    _getSynced(): any;
    validate(): any;
    isSynced(): boolean;
    sanitizeAttributes(attributes: any): any;
}
declare const _default: typeof BaseModelClass;
/**
 * @class module:Okta.BaseModel
 * @extends module:Okta.Model
 * @deprecated Use {@link module:Okta.Model|Okta.Model} instead
 * @example
 * var Model = BaseModel.extend({
 *   defaults: {
 *     name: BaseModel.ComputedProperty(['fname', 'lname'], function (fname, lname) {
 *       return fname + ' ' + lname;
 *     })
 *   }
 * });
 * var model = new Model({fname: 'Joe', lname: 'Doe'});
 * model.get('name'); //=> "Joe Doe"
 * model.toJSON(); //=> {fname: 'Joe', lname: 'Doe'}
 *
 * model.set('__private__', 'private property');
 * model.get('__private__'); //=> "private property"
 * model.toJSON(); //=> {fname: 'Joe', lname: 'Doe'}
 */
export default _default;
