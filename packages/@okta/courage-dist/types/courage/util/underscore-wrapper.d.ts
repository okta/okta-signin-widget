import _ from 'underscore';
export interface OktaUnderscore extends _.UnderscoreStatic {
    resultCtx: (object: any, property: any, context?: any, defaultValue?: any) => any;
    isInteger: (value: any) => boolean;
    template: (source: any, data: any) => _.CompiledTemplate;
}
export declare const logIfStringTemplate: (template: any) => void;
export declare const isTemplateAHandlebarsTemplate: (template: any) => boolean;
declare const oktaUnderscore: OktaUnderscore;
export default oktaUnderscore;
