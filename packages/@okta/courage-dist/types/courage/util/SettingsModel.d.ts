import { ModelInstance, ModelConstructor } from '../models/Model';
interface SettingsModelPublic {
    hasFeature(featureName: string): boolean;
    hasAnyFeature(featureArray: any): any;
    hasPermission(permission: any): any;
    isDsTheme(): any;
}
export interface SettingsModelInstance extends SettingsModelPublic, ModelInstance {
    features: string[];
}
export interface SettingsModelConstructor extends ModelConstructor {
    new (attributes?: any, options?: any): SettingsModelInstance;
    extend<S = SettingsModelConstructor>(properties: any, classProperties?: any): S;
}
declare const _default: SettingsModelConstructor;
export default _default;
