import FrameworkModel from '../framework/Model';
import { _Result } from 'backbone';
import { AuthParams } from '../util/OrchestratorProvider';
export declare class ModelClass extends FrameworkModel {
    secureJSON: _Result<boolean>;
    scopes?: string[];
    authParams?: AuthParams;
}
declare const _default: typeof ModelClass;
/**
 * Wrapper around the more generic {@link src/framework/Model} that
 * contains Okta-specific logic.
 * @class module:Okta.Model
 * @extends src/framework/Model
 */
export default _default;
