/// <reference types="jquery" />
import Backbone, { _Result } from 'backbone';
export interface FrameworkCollectionFetchOptions extends Backbone.CollectionFetchOptions {
    fromFetch?: boolean;
    abort?: boolean;
}
export declare class FrameworkCollectionClass extends Backbone.Collection {
    static isCourageCollection: true;
    params: Record<string, any> | _Result<Record<string, any>>;
    setPagination(params: any, options?: any): void;
    getFetchData(): Record<string, any>;
    getPaginationData(): Record<string, any>;
    hasMore(): boolean;
    fetchMore(): JQueryXHR;
    where<F extends boolean>(properties: any, first?: boolean): F extends true ? any : any[];
}
/**
 *
 * Archer.Collection is a standard [Backbone.Collection](http://backbonejs.org/#Collection) with pre-set `data`
 * parameters and built in pagination - works with [http link headers](https://tools.ietf.org/html/rfc5988)
 * out of the box:
 *
 * @class src/framework/Collection
 * @extends external:Backbone.Collection
 * @example
 * var Users = Archer.Collection.extend({
 *   url: '/api/v1/users'
 *   params: {expand: true}
 * });
 * var users = new Users(null, {params: {type: 'new'}}),
 *     $button = this.$('a.fetch-more');
 *
 * $button.click(function () {
 *   users.fetchMore();
 * });
 *
 * this.listenTo(users, 'sync', function () {
 *   $button.toggle(users.hasMore());
 * });
 *
 * collection.fetch(); //=> '/api/v1/users?expand=true&type=new'
 */
declare const Collection: typeof FrameworkCollectionClass;
export default Collection;
