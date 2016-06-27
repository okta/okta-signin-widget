/**
* @class Backbone.Model
*
* See: [Backbone.Model](http://backbonejs.org/#Model-constructor)
*/

/**
 * @method parse
 * `parse` is called whenever a model's data is returned by the server, in {@link #fetch}, and {@link #save}.
 * The function is passed the raw `response` object, and should return the attributes hash to be {@link #set}
 * on the model. The default implementation is a no-op, simply passing through the JSON response.
 * Override this if you need to work with a pre existing API, or better namespace your responses.
 *
 * See [Backbone.Model.parse](http://backbonejs.org/#Model-parse)
 * @param {Object} response
 * @param {Object} options
 * @return {Object}
 */

/**
 * @method clear
 * Removes all attributes from the model, including the id attribute.
 * Fires a `"change"` event unless `silent` is passed as an option.
 * Leaves the derived properties in act.
 *
 * See [Backbone.Model.clear](http://backbonejs.org/#Model-clear)
 * @param {Object} [options]
 */

/**
 * @method escape
 * Similar to get, but returns the HTML-escaped version of a model's attribute.
 * If you're interpolating data from the model into HTML, using **escape** to retrieve attributes
 * will prevent [XSS](http://en.wikipedia.org/wiki/Cross-site_scripting) attacks.
 *
 * See [Backbone.Model.escape](http://backbonejs.org/#Model-escape)
 * @param {String} attribute
 */

/**
 * @method has
 * Returns `true` if the attribute is set to a non-null or non-undefined value.
 *
 * See [Backbone.Model.has](http://backbonejs.org/#Model-has)
 * @param {String} attribute
 */

/**
 * @method unset
 * Remove an attribute by deleting it from the internal attributes hash.
 * Fires a `"change"` event unless `silent` is passed as an option.
 *
 * See [Backbone.Model.unset](http://backbonejs.org/#Model-unset)
 * @param {String} attribute
 * @param {Object} [options]
 */

/**
 * @property {String} [id]
 * @readonly
 * A special property of models, the **id** is an arbitrary string (integer id or UUID).
 * If you set the id in the attributes hash, it will be copied onto the model as a direct property.
 * Models can be retrieved by id from collections, and the id is used to generate model URLs by default.
 *
 * See [Backbone.Model.id](http://backbonejs.org/#Model-id)
 */

/**
 * @property {String} [idAttribute]
 * A model's unique identifier is stored under the id attribute.
 * If you're directly communicating with a backend (CouchDB, MongoDB) that uses a different unique key,
 * you may set a Model's `idAttribute` to transparently map from that key to `id`.
 *
 * ```javascript
 * var Meal = Model.extend({
 *   idAttribute: "_id"
 * });
 *
 * var cake = new Meal({ _id: 1, name: "Cake" });
 * alert("Cake id: " + cake.id);
 * ```
 *
 * See [Backbone.Model.idAttribute](http://backbonejs.org/#Model-idAttribute)
 */

/**
 * @property {String} [cid]
 * @readonly
 * A special property of models, the **cid** or client id is a unique identifier automatically assigned
 * to all models when they're first created. Client ids are handy when the model has not yet been saved to the server,
 * and does not yet have its eventual true **id**, but already needs to be visible in the UI.
 *
 * See [Backbone.Model.cid](http://backbonejs.org/#Model-cid)
 */

/**
 * @property {Object} attributes
 * @readonly
 * The **attributes** property is the internal hash containing the model's state —
 * usually (but not necessarily) a form of the JSON object representing the model data on the server.
 * It's often a straightforward serialization of a row from the database,
 * but it could also be client-side computed state.
 *
 * Please use set to update the attributes instead of modifying them directly.
 * If you'd like to retrieve and munge a copy of the model's attributes, use _.clone(model.attributes) instead.
 *
 * _Due to the fact that Events accepts space separated lists of events, attribute names should not include spaces._
 *
 * See [Backbone.Model.attributes](http://backbonejs.org/#Model-attributes)
 */

/**
 * @property {Object} changed
 * @readonly
 * The changed property is the internal hash containing all the attributes that have changed since the last set.
 * Please do not update changed directly since its state is internally maintained by set.
 * A copy of changed can be acquired from {@link #changedAttributes}.
 *
 * See [Backbone.Model.attributes](http://backbonejs.org/#Model-attributes)
 */

/**
 * @method sync
 * Uses [Backbone.sync](http://backbonejs.org/#Sync) to persist the state of a model to the server.
 * Can be overridden for custom behavior.
 *
 * See [Backbone.Model.sync](http://backbonejs.org/#Model-sync)
 * @param {String} method
 * @param {Backbone.Model} model
 * @param {Object} [options]
 */

/**
 * @method fetch
 * Resets the model's state from the server by delegating to [Backbone.sync](http://backbonejs.org/#Sync).
 * Returns a [jqXHR](http://api.jquery.com/jQuery.ajax/#jqXHR).
 * Useful if the model has never been populated with data, or if you'd like to ensure that you have the
 * latest server state. A `"change"` event will be triggered if the server's state differs from the
 * current attributes. Accepts `success` and `error` callbacks in the options hash,
 * which are both passed `(model, response, options)` as arguments.
 *
 * See [Backbone.Model.fetch](http://backbonejs.org/#Model-fetch)
 * @param {Object} [options]
 */

/**
 * @method save
 * Save a model to your database (or alternative persistence layer),
 * by delegating to [Backbone.sync](http://backbonejs.org/#Sync).
 * Returns a [jqXHR](http://api.jquery.com/jQuery.ajax/#jqXHR) if validation is successful and false otherwise.
 * The attributes hash (as in set) should contain the attributes you'd like to change — keys that aren't mentioned
 * won't be altered — but, a complete representation of the resource will be sent to the server.
 * As with set, you may pass individual keys and values instead of a hash.
 * If the model has a {@link #validate} method, and validation fails, the model will not be saved.
 * If the model {@link #isNew}, the save will be a `"create"` (HTTP `POST`),
 * if the model already exists on the server, the save will be an `"update"` (HTTP `PUT`).
 *
 * If instead, you'd only like the changed attributes to be sent to the server,
 * call `model.save(attrs, {patch: true})`.
 * You'll get an HTTP PATCH request to the server with just the passed-in attributes.
 *
 * Calling `save` with new attributes will cause a `"change"` event immediately,
 * a `"request"` event as the Ajax request begins to go to the server, and a `"sync"` event after the server has
 * acknowledged the successful change. Pass `{wait: true}` if you'd like to wait for the server before
 * setting the new attributes on the model.
 *
 * **save** accepts `success` and `error` callbacks in the options hash, which will be
 * passed the arguments `(model, response, options)`. If a server-side validation fails,
 * return a non-200 HTTP response code, along with an error response in text or JSON.
 *
 * ```javascript
 * book.save("author", "F.D.R.", {error: function(){ ... }});
 * ```
 * See [Backbone.Model.save](http://backbonejs.org/#Model-save)
 * @param {Object} [attributes]
 * @param {Object} [options]
 */

/**
 * @method destroy
 * Destroys the model on the server by delegating an HTTP `DELETE`
 * request to [Backbone.sync](http://backbonejs.org/#Sync).
 * Returns a [jqXHR](http://api.jquery.com/jQuery.ajax/#jqXHR) object, or false if the model {@link #isNew}.
 * Accepts `success` and `error` callbacks in the options hash, which will be passed `(model, response, options)`.
 * Triggers a `"destroy"` event on the model, which will bubble up through any collections that contain it,
 * a `"request"` event as it begins the Ajax request to the server, and a `"sync"` event,
 * after the server has successfully acknowledged the model's deletion.
 * Pass `{wait: true}` if you'd like to wait for the server to respond before removing the model from the collection.
 *
 * See [Backbone.Model.destroy](http://backbonejs.org/#Model-destroy)
 * @param {Object} [options]
 */

/**
 * @property {Object} validationError
 * The value returned by {@link #validate} during the last failed validation.
 * Returns a key/value set of errors when the key is the field name, and the value is the error message.
 * Returns undefined if the model is valid.
 * @readonly
 * See [Backbone.Model.validationError](http://backbonejs.org/#Model-validationError)
 */

/**
 * @method isValid
 * Run {@link #validate} to check the model state.
 *
 * See [Backbone.Model.isValid](http://backbonejs.org/#Model-isValid)
 * @return {Boolean}
 */

/**
 * @method url
 * Returns the relative URL where the model's resource would be located on the server.
 * If your models are located somewhere else, override this method with the correct logic.
 * Generates URLs of the form: `"[collection.url]/[id]"` by default,
 * but you may override by specifying an explicit urlRoot if the model's collection shouldn't be taken into account.
 *
 * Delegates to {@link Backbone.Collection#url} to generate the URL, so make sure that you have it defined,
 * or a {@link #urlRoot} property, if all models of this class share a common root URL.
 * A model with an id of `101`, stored in a {@link Backbone.Collection} with a url of `"/documents/7/notes"`,
 * would have this URL: `"/documents/7/notes/101"`
 *
 * See [Backbone.Model.url](http://backbonejs.org/#Model-url)
 * @return {Boolean}
 */

/**
 * @property {String|Function} urlRoot
 * Specify a `urlRoot` if you're using a model outside of a collection,
 * to enable the default {@link #url} function to generate URLs based on the model id. `"[urlRoot]/id"`
 * Normally, you won't need to define this. Note that urlRoot may also be a function.
 *
 * See [Backbone.Model.urlRoot](http://backbonejs.org/#Model-urlRoot)
 * @return {Boolean}
 */

/**
 * @method clone
 * Returns a new instance of the model with identical attributes.
 *
 * See [Backbone.Model.clone](http://backbonejs.org/#Model-clone)
 * @return {Backbone.Model}
 */

/**
 * @method isNew
 * Has this model been saved to the server yet? If the model does not yet have an `id`, it is considered to be new.
 *
 * See [Backbone.Model.isNew](http://backbonejs.org/#Model-isNew)
 * @return {Boolean}
 */

/**
 * @method hasChanged
 * Has the model changed since the last {@link #set}? If an attribute is passed,
 * returns `true if that specific attribute has changed.
 *
 * See [Backbone.Model.hasChanged](http://backbonejs.org/#Model-hasChanged)
 * @param {String} [attribute]
 * @return {Boolean}
 */

/**
 * @method changedAttributes
 * Retrieve a hash of only the model's attributes that have changed since the last {@link #set},
 * or `false` if there are none. Optionally, an external attributes hash can be passed in,
 * returning the **attributes** in that hash which differ from the model.
 * This can be used to figure out which portions of a view should be updated,
 * or what calls need to be made to sync the changes to the server.
 *
 * See [Backbone.Model.changedAttributes](http://backbonejs.org/#Model-changedAttributes)
 * @param {String} [attributes]
 * @return {Boolean|Object}
 */

/**
 * @method previous
 * During a `"change"` event, this method can be used to get the previous value of a changed attribute.
 *
 * See [Backbone.Model.previous](http://backbonejs.org/#Model-previous)
 * @param {String} [attribute]
 * @return {Mixed}
 */

/**
 * @method previousAttributes
 * Return a copy of the model's previous attributes.
 * Useful for getting a diff between versions of a model, or getting back to a valid state after an error occurs.
 *
 * See [Backbone.Model.previousAttributes](http://backbonejs.org/#Model-previousAttributes)
 * @return {Object}
 */

/**
 * @method keys
 * Retrieve all the names of the model's properties.
 *
 * See [_.keys](http://underscorejs.org/#keys)
 * @return {Array}
 */

/**
 * @method values
 * Retrieve all the values of the model's properties.
 *
 * See [_.values](http://underscorejs.org/#values)
 * @return {Array}
 */

/**
 * @method pairs
 * Convert the model into a list of `[key, value]` pairs.
 *
 * See [_.pairs](http://underscorejs.org/#pairs)
 * @return {Array}
 */

/**
 * @method invert
 * Returns a copy of the model's **attributes** where the keys have become the values and the values the keys.
 * For this to work, all of your object's values should be unique and string serializable.
 *
 * See [_.invert](http://underscorejs.org/#invert)
 * @return {Object}
 */

/**
 * @method pick
 * Return a copy of the model's **attributes**, filtered to only have values for the whitelisted keys.
 *
 * See [_.pick](http://underscorejs.org/#pick)
 * @return {Object}
 */

/**
 * @method omit
 * Return a copy of the model's **attributes**, filtered to  filtered to omit the blacklisted.
 *
 * See [_.omit](http://underscorejs.org/#omit)
 * @return {Object}
 */

/**
 * @method validate
 * This method is left undefined, and you're encouraged to override it with your custom validation logic,
 * if you have any that can be performed in JavaScript. By default **validate** is called before `{@link #save}`,
 * but can also be called before set if `{validate:true}` is passed.
 * The **validate** method is passed the model attributes, as well as the options from `{@link #set}` or
 * `{@link #save}`. If the attributes are valid, don't return anything from **validate**;
 * if they are invalid, return a key/value set where the key is the field name, and the value is the error message:
 *
 * ```javascript
 * validate: function () {
 *   if (this.get('name') && !this.get('age')) {
 *     return {'age': 'Age has to present when name is present'};
 *   }
 * }
 * ```
 * If **validate** returns an error, `save` will not continue, and the model attributes will not be modified
 * on the server. Failed validations trigger an `"invalid"` event, and set the `validationError` property on the
 * model with the value returned by this method.
 *
 * `"invalid"` events are useful for providing coarse-grained error messages at the model or collection level.
 *
 * See [Backbone.Model.validate](http://backbonejs.org/#Model-validate)
 * @param {Object} attributes
 * @param {Object} options
 *
 * @return {Object}
 */

/**
 * @method set
 * Set a hash of attributes (one or many) on the model. If any of the attributes change the model's state,
 * a `"change"` event will be triggered on the model.
 * Change events for specific attributes are also triggered, and you can bind to those as well,
 * for example: `change:title`, and `change:content`.
 * You may also pass individual keys and values.
 *
 * ```javascript
 * note.set({title: "March 20", content: "In his eyes she eclipses..."});
 *
 * book.set("title", "A Scandal in Bohemia");
 * ```
 * @param {Object} attributes
 * @param {Object} [options]
 * See [Backbone.Model.set](http://backbonejs.org/#Model-set)
 */

/**
 * @method get
 * Get the current value of an attribute from the model. For example: `note.get("title")`
 *
 * See [Backbone.Model.get](http://backbonejs.org/#Model-get)
 * @param {String} attribute
 * @return {Mixed} The value of the model attribute
 */

/**
 * @property {Object|Function} defaults]
 * The **defaults** hash (or function) can be used to specify the default attributes for your model.
 * When creating an instance of the model, any unspecified attributes will be set to their default value.
 *
 * ```javascript
 * var Meal = Model.extend({
 *   defaults: {
 *     "appetizer":  "caesar salad",
 *     "entree":     "ravioli",
 *     "dessert":    "cheesecake"
 *   }
 * });
 * ```
 *
 * _Remember that in JavaScript, objects are passed by reference, so if you include an object as a default value,
 * it will be shared among all instances. Instead, define **defaults** as a function._
 *
 * See [Backbone.Model.attributes](http://backbonejs.org/#Model-attributes)
 * @type {Object|Function}
 */


// ######### Collection ###########

/**
* @class Backbone.Collection
* See: [Backbone.Collection](http://backbonejs.org/#Collection-constructor)
*/


/**
 * @property {String|Function} url
 * Set the url property (or function) on a collection to reference its location on the server.
 * Models within the collection will use url to construct URLs of their own.
 *
 * See: [Backbone.Collection.url](http://backbonejs.org/#Collection-url)
 */

/**
 * @property {Backbone.Model} model
 * Override this property to specify the model class that the collection contains.
 * If defined, you can pass raw attributes objects (and arrays) to add,create, and reset,
 * and the attributes will be converted into a model of the proper type.
 *
 * A collection can also contain polymorphic models by overriding this property with a
 * constructor that returns a model.
 *
 * See: [Backbone.Collection.model](http://backbonejs.org/#Collection-model)
 */

/**
 * @property {Backbone.Model[]} models
 * Raw access to the JavaScript array of models inside of the collection.
 * Usually you'll want to use get, at, or the Underscore methods to access model objects,
 * but occasionally a direct reference to the array is desired.
 *
 * See: [Backbone.Collection.models](http://backbonejs.org/#Collection-models)
 */

/**
 * @method toJSON
 * @return {Object}
 * Return an array containing the attributes hash of each model (via toJSON) in the collection.
 * This can be used to serialize and persist the collection as a whole.
 * The name of this method is a bit confusing, because it conforms to JavaScript's JSON API.
 *
 * See: [Backbone.Collection.toJSON](http://backbonejs.org/#Collection-toJSON)
 */

/**
 * @method sync
 * @return {Array}
 *
 * Returns an array containing the attributes hash of each model
 * (via toJSON) in the collection
 *
 * This can be used to serialize and persist the collection as a whole.
 * The name of this method is a bit confusing, because it conforms to JavaScript's JSON API.
 *
 * See: [Backbone.Collection.sync](http://backbonejs.org/#Collection-sync)
 */

/**
 * @method add
 * @param {Backbone.Model[]} models
 * @param {Object} [options]
 * @return {Backbone.Model[]} the newly-set models.
 * Add a model (or an array of models) to the collection, firing an "add"
 * event. If a model property is defined, you may also pass raw
 * attributes objects, and have them be vivified as instances of the
 * model.
 * Pass `{at: index}` to splice the model into the collection at the
 * specified index.
 * If you're adding models to the collection that are already in
 * the collection, they'll be ignored, unless you pass `{merge: true}`,
 * in which case their attributes will be merged into the corresponding
 * models, firing any appropriate "change" events.
 *
 * See: [Backbone.Collection.add](http://backbonejs.org/#Collection-add)
 */

/**
 * @method remove
 * @param {Backbone.Model[]} models
 * @param {Object} [options]
 * Remove a model (or an array of models) from the collection, and returns
 * them. Fires a "remove" event, which you can use silent to suppress.
 * The model's index before removal is available to listeners as
 * `options.index`.
 *
 * See: [Backbone.Collection.remove](http://backbonejs.org/#Collection-remove)
 */

/**
 * @method reset
 * @param {Backbone.Model[]} [models]
 * @param {Object} [options]
 * @return {Backbone.Model[]} the newly-set models.
 * Adding and removing models one at a time is all well and good, but
 * sometimes you have so many models to change that you'd rather just
 * update the collection in bulk. Use reset to replace a collection with a
 * new list of models (or attribute hashes), triggering a single "reset"
 * event at the end.
 * For convenience, within a "reset" event, the list of any previous
 * models is available as `options.previousModels`.
 *
 * See: [Backbone.Collection.reset](http://backbonejs.org/#Collection-reset)
 */

/**
 * @method set
 * @param {Backbone.Model[]} models
 * @param {Object} [options]
 * @return {Backbone.Model[]} the touched models in the collection.
 * The set method performs a "smart" update of the collection with the
 * passed list of models. If a model in the list isn't yet in the
 * collection it will be added; if the model is already in the collection
 * its attributes will be merged; and if the collection contains any
 * models that aren't present in the list, they'll be removed.
 * All of the appropriate "add", "remove", and "change" events are fired
 * as this happens.
 * If you'd like to customize the behavior, you can disable it with
 * options: `{add: false}`, `{remove: false}`, or `{merge: false}`.
 *
 * See: [Backbone.Collection.set](http://backbonejs.org/#Collection-set)
 */

/**
 * @method get
 * @param {String|Number} id
 * @return {Backbone.Model}
 * Get a model from a collection, specified by an id, a cid, or by passing
 * in a model.
 *
 * See: [Backbone.Collection.get](http://backbonejs.org/#Collection-get)
 */

/**
 * @method at
 * @param {Number} id
 * @return {Backbone.Model}
 * Get a model from a collection, specified by index. Useful if your collection
 * is sorted, and if your collection isn't sorted, at will still retrieve
 * models in insertion order.
 *
 * See: [Backbone.Collection.at](http://backbonejs.org/#Collection-at)
 */

/**
 * @method push
 * @param {Backbone.Model} model
 * @param {Object} [options]
 * Add a model at the end of a collection. Takes the same options as {@link #add}.
 *
 * See: [Backbone.Collection.push](http://backbonejs.org/#Collection-push)
 */

/**
 * @method pop
 * @param {Object} [options]
 * @return {Backbone.Model}
 * Remove and return the last model from a collection. Takes the same options as remove.
 *
 * See: [Backbone.Collection.pop](http://backbonejs.org/#Collection-pop)
 */


/**
 * @method unshift
 * @param {Backbone.Model} model
 * @param {Object} [options]
 * Add a model at the beginning of a collection. Takes the same options as add.
 *
 * See: [Backbone.Collection.unshift](http://backbonejs.org/#Collection-unshift)
 */

/**
 * @method shift
 * @param {Object} [options]
 * @return {Backbone.Model}
 * Remove and return the first model from a collection. Takes the same options as remove.
 *
 * See: [Backbone.Collection.shift](http://backbonejs.org/#Collection-shift)
 */

/**
 * @method slice
 * @param {Number} begin
 * @param {Number} end
 * @return {Backbone.Model[]}
 * Return a shallow copy of this collection's models, using the same options as native Array#slice.
 *
 * See: [Backbone.Collection.slice](http://backbonejs.org/#Collection-slice)
 */

/**
 * @method length
 * @return {Number}
 * Like an array, a Collection maintains a length property, counting the number of models it contains.
 *
 * See: [Backbone.Collection.length](http://backbonejs.org/#Collection-length)
 */

/**
 * @method comparator
 * By default there is no comparator for a collection. If you define a comparator, it will be used to maintain
 * the collection in sorted order. This means that as models are added, they are inserted at the correct index
 * in collection.models. A comparator can be defined as a sortBy (pass a function that takes a single argument),
 * as a sort (pass a comparator function that expects two arguments),
 * or as a string indicating the attribute to sort by.
 *
 * See: [Backbone.Collection.comparator](http://backbonejs.org/#Collection-comparator)
 */

/**
 * @method sort
 * @param {Object} [options]
 * Force a collection to re-sort itself. You don't need to call this under normal circumstances, as a collection
 * with a comparator will sort itself whenever a model is added. To disable sorting when adding a model,
 * pass `{sort: false}` to add. Calling sort triggers a "sort" event on the collection.
 *
 * See: [Backbone.Collection.sort](http://backbonejs.org/#Collection-sort)
 */

/**
 * @method pluck
 * @param {String} attribute
 * @return {Array}
 * Pluck an attribute from each model in the collection. Equivalent to calling map and returning a single attribute
 * from the iterator.
 *
 * See: [Backbone.Collection.pluck](http://backbonejs.org/#Collection-pluck)
 */

/**
 * @method where
 * @param {Object} attributes
 * @return {Backbone.Model[]}
 * Return an array of all the models in a collection that match the passed attributes.
 * Useful for simple cases of filter.
 *
 * See: [Backbone.Collection.where](http://backbonejs.org/#Collection-where)
 */

/**
 * @method findWhere
 * @param {Object} attributes
 * @return {Backbone.Model}
 * Just like where, but directly returns only the first model in the collection that matches the passed attributes.
 *
 * See: [Backbone.Collection.findWhere](http://backbonejs.org/#Collection-findWhere)
 */

/**
 * @method parse
 * @param {Object} response
 * @param {Object} options
 * @return {Object}
 * `parse` is called by Backbone whenever a collection's models are returned by the server, in {@link #fetch}`.
 * The function is passed the raw response object, and should return the array of model attributes to be added
 * to the collection. The default implementation is a no-op, simply passing through the JSON response. Override
 * this if you need to work with a preexisting API, or better namespace your responses.
 *
 * See: [Backbone.Collection.parse](http://backbonejs.org/#Collection-parse)
 */

/**
 * @method clone
 * @return {Backbone.Collection}
 * Returns a new instance of the collection with an identical list of models.
 *
 * See: [Backbone.Collection.clone](http://backbonejs.org/#Collection-clone)
 */

/**
 * @method fetch
 * @param {Object} options
 * @return {jqXHR}
 * Fetch the default set of models for this collection from the server, setting them on the collection when
 * they arrive. The options hash takes success and error callbacks which will both be passed
 * (collection, response, options) as arguments. When the model data returns from the server,
 * it uses set to (intelligently) merge the fetched models, unless you pass `{reset: true}`,
 * in which case the collection will be (efficiently) reset. Delegates to `Backbone.sync` under
 * the covers for custom persistence strategies and returns a jqXHR.
 * The server handler for `fetch` requests should return a JSON array of models.
 *
 * See: [Backbone.Collection.fetch](http://backbonejs.org/#Collection-fetch)
 */

/**
 * @method create
 * @param {Object} attributes
 * @param {Object} [options]
 * @return {Backbone.Model}
 * Convenience to create a new instance of a model within a collection. Equivalent to instantiating a model
 * with a hash of attributes, saving the model to the server, and adding the model to the set after being
 * successfully created. Returns the new model. If client-side validation failed, the model will be unsaved,
 * with validation errors. In order for this to work, you should set the model property of the collection.
 * The create method can accept either an attributes hash or an existing, unsaved model object.
 *
 * Creating a model will cause an immediate "add" event to be triggered on the collection, a "request" event
 * as the new model is sent to the server, as well as a "sync" event, once the server has responded with the
 * successful creation of the model. Pass `{wait: true}` if you'd like to wait for the server before adding
 * the new model to the collection.
 *
 * See: [Backbone.Collection.create](http://backbonejs.org/#Collection-create)
 */


// ######### View ###########

/**
* @class Backbone.View
* Backbone views are almost more convention than they are code — they don't determine anything about your HTML or
* CSS for you, and can be used with any JavaScript templating library. The general idea is to organize your
* interface into logical views, backed by models, each of which can be updated independently when the model changes,
* without having to redraw the page. Instead of digging into a JSON object, looking up an element in the DOM, and
* updating the HTML by hand, you can bind your view's render function to the model's "change" event — and now
* everywhere that model data is displayed in the UI, it is always immediately up to date.

* See: [Backbone.View](http://backbonejs.org/#View-constructor)
*/

/**
 * @method extend
 * @static
 * @param {Object} properties
 * @param {Object} classProperties
 * Get started with views by creating a custom view class. You'll want to override the render function, specify your
 * declarative events, and perhaps the tagName, className, or id of the View's root element.
 *
 * ```javascript
 * var DocumentRow = Backbone.View.extend({
 *
 *   tagName: "li",
 *
 *   className: "document-row",
 *
 *   events: {
 *     "click .icon":          "open",
 *     "click .button.edit":   "openEditDialog",
 *     "click .button.delete": "destroy"
 *    },
 *
 *    initialize: function() {
 *      this.listenTo(this.model, "change", this.render);
 *    },
 *
 *   render: function() {
 *     // ...
 *   }
 * });
 *
 * ```
 * Properties like `tagName`, `id`, `className`, `el`, and `events` may also be defined as a function,
 * if you want to wait to define them until runtime.
 */

/**
 *
 * @constructor
 * @param {Object} options options hash
 * There are several special options that, if passed, will be attached directly to the view: `model`, `collection`,
 * `el`, `id`, `className`, `tagName`, `attributes` and `events`.
 * If the view defines an initialize function, it will be called when the view is first created.
 * If you'd like to create a view that references an element already in the DOM, pass in the element as an option:
 * `new View({el: existingElement})`
 *
 * ```javascript
 * var doc = documents.first();
 * new DocumentRow({
 *   model: doc,
 *   id: "document-row-" + doc.id
 * });
 * ```
 */

/**
 * @property {Mixed} el
 * All views have a DOM element at all times (the el property), whether they've already been inserted into the page
 * or not. In this fashion, views can be rendered at any time, and inserted into the DOM all at once, in order to get
 * high-performance UI rendering with as few reflows and repaints as possible. this.el is created from the view's
 * tagName, className, id and attributes properties, if specified. If not, el is an empty div.
 *
 * ```javascript
 * var ItemView = Backbone.View.extend({
 *   tagName: 'li'
 * });
 *
 * var BodyView = Backbone.View.extend({
 *   el: 'body'
 * });
 *
 * var item = new ItemView();
 * var body = new BodyView();
 *
 * alert(item.el + ' ' + body.el); //=> [object HTMLLIElement] [object HTMLBodyElement]
 * ```
 */

/**
 * @property {Object} $el
 * A cached jQuery object for the view's element. A handy reference instead of re-wrapping the DOM element all the
 * time.
 *
 * ```javascript
 * view.$el.show();
 * listView.$el.append(itemView.el);
 * ```
 */

/**
 * @method setElement
 * If you'd like to apply a Backbone view to a different DOM element, use setElement, which will also create the cached
 * $el reference and move the view's delegated events from the old element to the new one.
 * @param {Mixed} element
 */

/**
 * @property {Object} attributes
 * A hash of attributes that will be set as HTML DOM element attributes on the view's el
 * (id, class, data-properties, etc.), or a function that returns such a hash.
 */

/**
 * @method $
 * If jQuery is included on the page, each view has a $ function that runs queries scoped within the view's element.
 * If you use this scoped jQuery function, you don't have to use model ids as part of your query to pull out specific
 * elements in a list, and can rely much more on HTML class attributes.
 * It's equivalent to running: view.$el.find(selector)
 *
 * ```javascript
 * ui.Chapter = Backbone.View.extend({
 *   serialize : function() {
 *     return {
 *       title: this.$(".title").text(),
 *       start: this.$(".start-page").text(),
 *       end:   this.$(".end-page").text()
 *     };
 *   }
 * });
 * ```
 * @param {String} selector
 */

/**
 * @method remove
 * Removes a view from the DOM, and calls stopListening to remove any bound events that the view has listenTo'd.
 */

/**
 * @method delegateEvents
 * Uses jQuery's on function to provide declarative callbacks for DOM events within a view. If an events hash is not
 * passed directly, uses this.events as the source. Events are written in the format {"event selector": "callback"}.
 * The callback may be either the name of a method on the view, or a direct function body. Omitting the selector causes
 * the event to be bound to the view's root element (this.el). By default, delegateEvents is called within the View's
 * constructor for you, so if you have a simple events hash, all of your DOM events will always already be connected,
 * and you will never have to call this function yourself.
 *
 * The events property may also be defined as a function that returns an events hash, to make it easier to
 * programmatically define your events, as well as inherit them from parent views.
 *
 * Using delegateEvents provides a number of advantages over manually using jQuery to bind events to child elements
 * during render. All attached callbacks are bound to the view before being handed off to jQuery, so when the callbacks
 * are invoked, this continues to refer to the view object. When delegateEvents is run again, perhaps with a different
 * events hash, all callbacks are removed and delegated afresh — useful for views which need to behave differently when
 * in different modes.
 *
 * A view that displays a document in a search result might look something like this:
 *
 * ```javascript
 * var DocumentView = Backbone.View.extend({
 *
 *   events: {
 *     "dblclick"                : "open",
 *     "click .icon.doc"         : "select",
 *     "contextmenu .icon.doc"   : "showMenu",
 *     "click .show_notes"       : "toggleNotes",
 *     "click .title .lock"      : "editAccessLevel",
 *     "mouseover .title .date"  : "showTooltip"
 *   },
 *
 *   render: function() {
 *     this.$el.html(this.template(this.model.attributes));
 *     return this;
 *   },
 *
 *   open: function() {
 *     window.open(this.model.get("viewer_url"));
 *   },
 *
 *   select: function() {
 *     this.model.set({selected: true});
 *   },
 *
 *   // ...
 *
 * });
 * ```
 */

/**
 * @method undelegateEvents
 * Removes all of the view's delegated events. Useful if you want to disable or remove a view from the DOM temporarily.
 */


/**
 * @property {Function} template
 * While templating for a view isn't a function provided directly by Backbone, it's often a nice convention to define a
 * template function on your views. In this way, when rendering your view, you have convenient access to instance data.
 * For example, using Underscore templates:
 *
 * ```javascript
 * var LibraryView = Backbone.View.extend({
 *   template: _.template(...)
 * });
 * renderview.render()
 * ```
 * The default implementation of render is a no-op. Override this function with your code that renders the view template
 * from model data, and updates this.el with the new HTML. A good convention is to return this at the end of render to
 * enable chained calls.
 *
 * ```javascript
 * var Bookmark = Backbone.View.extend({
 *   template: _.template(...),
 *   render: function() {
 *     this.$el.html(this.template(this.model.attributes));
 *     return this;
 *   }
 * });
 * ```
 * Backbone is agnostic with respect to your preferred method of HTML templating. Your render function could even munge
 * together an HTML string, or use document.createElement to generate a DOM tree. However, we suggest choosing a nice
 * JavaScript templating library. Mustache.js, Haml-js, and Eco are all fine alternatives. Because Underscore.js is
 * already on the page, _.template is available, and is an excellent choice if you prefer simple interpolated-JavaScript
 * style templates.
 *
 * Whatever templating strategy you end up with, it's nice if you never have to put strings of HTML in your JavaScript.
 * At DocumentCloud, we use Jammit in order to package up JavaScript templates stored in /app/views as part of our main
 * core.js asset package.
 * @param {Object} data
 */