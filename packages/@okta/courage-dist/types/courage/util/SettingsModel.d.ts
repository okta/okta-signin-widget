import Model from '../models/Model';
export declare class SettingsModelClass extends Model {
    protected features: string[];
    hasFeature(featureName: string): boolean;
    hasAnyFeature(featureArray: string[]): boolean;
    hasPermission(permission: string): boolean;
    isDsTheme(): boolean;
}
declare const _default: typeof SettingsModelClass;
export default _default;
