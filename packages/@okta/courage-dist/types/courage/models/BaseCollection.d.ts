import Collection from '../framework/Collection';
import { _Result } from 'backbone';
export declare class BaseCollectionClass extends Collection {
    secureJSON: _Result<boolean>;
}
declare const _default: typeof BaseCollectionClass;
/**
 * Wrapper around the more generic {@link src/framework/Collection} that
 * contains Okta-specific logic.
 * @class module:Okta.Collection
 * @extends src/framework/Collection
 */
export default _default;
