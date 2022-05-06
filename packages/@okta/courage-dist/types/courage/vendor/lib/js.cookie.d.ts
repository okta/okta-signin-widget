declare function _exports(key: any, value: any, attributes: any, ...args: any[]): {};
declare namespace _exports {
    function get(key: any, value: any, attributes: any, ...args: any[]): {};
    namespace get {
        export { api as set };
        export function getJSON(...args: any[]): any;
        export const defaults: {};
        export function remove(key: any, attributes: any): void;
        export { init as withConverter };
    }
}
export = _exports;
declare function api(key: any, value: any, attributes: any, ...args: any[]): {};
declare namespace api { }
declare function init(converter: any): {
    (key: any, value: any, attributes: any, ...args: any[]): {};
    get: any;
    set: any;
    getJSON(...args: any[]): any;
    defaults: {};
    remove(key: any, attributes: any): void;
    withConverter: (converter: any) => any;
};
