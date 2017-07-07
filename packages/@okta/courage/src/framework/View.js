(function (root, factory) {
  if (typeof define == 'function' && define.amd) {
    define(['okta/underscore', 'backbone'], factory);
  }
  /* global module, exports */
  else if (typeof require === 'function' && typeof exports === 'object') {
    module.exports = factory(require('okta/underscore'), require('backbone'));
  }
  else {
    root.Archer || (root.Archer = {});
    root.Archer.View = factory(root._, root.Backbone);
  }
}(this, function (_, Backbone) {

  var CHILDREN = '__children__',
      RENDERED = '__rendered__',
      PARENT = '__parent__',
      CHILD_DEFINITIONS = '__children_definitions__',
      ADD_TO_CONTAINER = '__add_to_container__';

  function getIndex(container, view) {
    for (var i = 0; i < container[CHILDREN].length; i++) {
      if (view.cid === container[CHILDREN][i].cid) {
        return i;
      }
    }
  }

  function noop() {}

  function doRender(view) {
    view[RENDERED] = true;

    var html = view.renderTemplate(view.template);
    if (html) {
      view.$el.html(html);
    }
    else if (view.length) {
      view.$el.empty();
    }

    view.each(function (view) {
      view[ADD_TO_CONTAINER]();
    });
  }

  function subscribeEvents(view) {
    var isEventPropertyRe = /^(?!(?:delegate|undelegate|_))([a-zA-Z0-9]+)(?:Events)$/;
    _.each(_.allKeys(view), function (key) {
      var matchKeys = key.match(isEventPropertyRe);
      if (!matchKeys) {
        return;
      }
      var bindings = _.result(view, key),
          entity = view.options[matchKeys[1]] || view[matchKeys[1]];
      if (!entity || !_.isObject(bindings) || !_.isFunction(entity.trigger)) {
        return;
      }
      _.each(bindings, function (callback, event) {
        var callbacks = _.isFunction(callback) ? [callback] : _.reduce(callback.split(/\s+/), function (arr, name) {
          if (_.isFunction(view[name])) {
            arr.push(view[name]);
          }
          return arr;
        }, []);
        _.each(callbacks, function (cb) {
          view.listenTo(entity, event, cb);
        });
      });
    });
  }

  var View = Backbone.View.extend({

    /**
    * @class Archer.View
    * @extend Backbone.View
    *
    * A View operates on a string template, an token based template, or a model based template, with a few added hooks.
    * It provides a collection of child views, when a child view could be a View or another View.
    * Conceptually, if we were in a file system, the View is a folder, when the concrete child views are files,
    * and the child Views are sub folders.
    *
    * *Technically, when using a View as a container, it could have its own concrete logic,
    * but conceptually we like to keep it separated so a view is either a concrete view or a collection of child views.*
    *
    * ```javascript
    * var DocumentView = Archer.View.extend({
    *   template: [
    *     '<header></header>',
    *     '<article></article>',
    *     '<footer></footer>'
    *   ].join(''),
    *   children: [[HeaderView, 'header'], [ContentView, 'article'], [FooterView, 'footer']]
    * });
    * ```
    * @constructor
    *
    * In addition to the standard backbone options, we added `settings` and `state` as first class options.
    * it will automatically assign `options` to `this.options` as an instance member.
    * @param {Object} [options] options hash
    */

    /**
     * @property {Object|Function} [entityEvents] an object listing events and callback bind to this.{entity}
     *
     * ```javascript
     * var FooView = View.extend({
     *   modelEvents: {
     *     'change:name': 'render'
     *   }
     * })
     * //equivalent to ==>
     * var FooView = View.extend({
     *   initialize: function() {
     *     this.listenTo(this.model, 'change:name', this.render);
     *   }
     * });
     *
     *
     * //Multiple callbacks:
     * var FooView = View.extend({
     *   modelEvents: {
     *     'change:name': 'render foo'
     *   },
     *   foo: function() {}
     * });
     *
     * //Callbacks As Function:
     * var FooView = View.extend({
     *   stateEvents: {
     *     'change': function() {
     *   }
     * });
     *
     * //Event Configuration As Function
     * var FooView = View.extend({
     *   collectionEvents: function() {
     *     var events = { 'change:name deleteItem': 'render' };
     *     events['changeItem'] = 'spin';
     *     events['addItem'] = function() {};
     *     return events;
     *   }
     * });
     * ```
     */
    constructor: function (options) {
      /* eslint max-statements: [2, 17] */
      this.options = options || {};
      _.extend(this, _.pick(this.options, 'state', 'settings'));

      // init per-instance children collection
      this[CHILDREN] = [];
      this[RENDERED] = false;
      this[PARENT] = null;
      this[CHILD_DEFINITIONS] = this.children;

      // we want to make sure initialize is triggered *after* we append the views from the `this.views` array
      var initialize = this.initialize;
      this.initialize = noop;

      Backbone.View.apply(this, arguments);

      _.each(_.result(this, CHILD_DEFINITIONS), function (childDefinition) {
        this.add.apply(this, _.isArray(childDefinition) ? childDefinition : [childDefinition]);
      }, this);
      delete this[CHILD_DEFINITIONS];

      if (this.autoRender && this.model) {
        var event = _.isArray(this.autoRender) ? _.map(this.autoRender, function (field) {
          return 'change:' + field;
        }).join(' ') : 'change';
        this.listenTo(this.model, event, function () {
          this.render();
        });
      }

      this.initialize = initialize;
      this.initialize.apply(this, arguments);
      subscribeEvents(this);
    },

    /**
    * Unregister view from container
    * Note: this will not remove the view from the dom
    * and will not call the `remove` method on the view
    *
    * @param {Archer.View} view the view to unregister
    * @private
    */
    unregister: function (view) {

      this.stopListening(view);
      var viewIndex = getIndex(this, view);
      // viewIndex is undefined when the view is not found (may have been removed)
      // check if it is undefined to prevent unexpected thing to happen
      // array.splice(undefined, x) removes the first x element(s) from the array
      // this protects us against issues when calling `remove` on a child view multiple times
      if (_.isNumber(viewIndex)) {
        this[CHILDREN].splice(viewIndex, 1);
      }
    },

    /**
     * Should we auto render the view upon model change. Boolean or array of field names to listen to.
     * @type {Boolean|Array}
     * @deprecated Instead, please use modelEvents
     * modelEvents: {
     *   change:name: 'render'
     * }
     */
    autoRender: false,

    /**
    * @type {(String|Function)}
    * @alias Backbone.View#template
    *
    * When the template is an underscore template, the render method will pass the options has to the template
    * And the associated model, if exists, when it will prefer the model over the options in case of a conflict.
    * {@link #render View.render}
    *
    * Example:
    *
    * ```javascript
    * var View = View.extend({
    *   template: '<p class="name">{{name}}</p>'
    * };
    * ```
    */
    template: null,

    /**
     * A list of child view definitions to be passed to {@link #add this.add()}
     *
     * ```javascript
     * var Container = View.extend({
     *    template: '<p class="content"></p>',
     *    children: [
     *      [ContentView, '.content'],
     *      [OtherContentView, '.content'],
     *      OtherView
     *    ]
     *  })
     *
     * var Container = View.extend({
     *    template: '<dov class="form-wrap"></div>',
     *    children: function () {
     *      return [
     *        [FormView, '.form-wrap', {options: {model: this.optiosn.otherModel}}]
     *      ]
     *    }
     *  })
     * ```
     * Note: these definitions will be added **before** the {@link #constructor initiliaze} method invokes.
     * @type {Array|Function}
     */
    children: [],

    /**
    * Add a child view to the container.
    * If the container is already rendered, will also render the view  and append it to the DOM.
    * Otherwise will render and append once the container is rendered.
    *
    * Examples:
    *
    * ```javascript
    * var Container = View.extend({
    *
    *   template: [
    *     '<h1></h1>',
    *     '<section></section>',
    *   ].join(''),
    *
    *   initalize: function () {
    *
    *     this.add(TitleView, 'h1'); // will be added to <h1>
    *
    *     this.add(ContentView1, 'section'); // will be added to <section>
    *
    *     this.add(ContentView2, 'section', {prepend: true}); // will be add into <section> **before** ContentView1
    *
    *     this.add(OtherView, {
    *       options: {
    *         model: new Model()
    *       }
    *     }); // will be added **after** the <section> element
    *
    *     this.add('<p class="name">some html</p>'); //=> "<p class="name">some html</p>"
    *     this.add('<p class="name">{{name}}</p>'); //=> "<p class="name">John Doe</p>"
    *     this.add('{{name}}') //=> "<div>John Doe</div>"
    *     this.add('<span>{{name}}</span> w00t') //=> "<div><span>John Doe</span> w00t</div>"
    *   }
    *
    * });
    *
    * var container - new View({name: 'John Doe'});
    *
    * ```
    * *We believe that for the sake of encapsulation, a view should control its own chilren, so we treat this method as
    * protected and even though technically you can call `view.add` externally we strongly discourage it.*
    *
    * @param {(Archer.View|String)} view A class (or an instance which is discouraged) of a View - or an HTML
    * string/template
    * @param {String} [selector] selector in the view's template on which the view will be added to
    * @param {Object} [options]
    * @param {Boolean} [options.bubble=false] Bubble (proxy) events from this view up the chain
    * @param {Boolean} [options.prepend=false] Prepend the view instend of appending
    * @param {String} [options.selector] Selector in the view's template on which the view will be added to
    * @param {Object} [options.options] Extra options to pass to the child constructor
    * @protected
    * @returns {Archer.View} - The instance of itself for the sake of chaining
    */
    add: function (view, selector, bubble, prepend, extraOptions) {
      /* eslint max-statements: [2, 28], complexity: [2, 8] */

      var options = {},
          args = _.toArray(arguments);

      if (_.isObject(selector)) {
        options = selector;
        selector = options.selector;
        bubble = options.bubble;
        prepend = options.prepend;
        extraOptions = options.options;
      }
      else if (_.isObject(bubble)) {
        options = bubble;
        bubble = options.bubble;
        prepend = options.prepend;
        extraOptions = options.options;
      }

      if (_.isString(view)) {
        view = (function (template) {
          return View.extend({
            constructor: function () {
              try {
                var $el = Backbone.$(template);
                if ($el.length != 1) { throw 'invalid Element'; }
                this.template = $el.html();
                this.el = $el.empty()[0];
              }
              catch (e) { // not a valid html tag.
                this.template = template;
              }
              View.apply(this, arguments);
            }
          });
        }(view));
      }

      if (view.prototype && view.prototype instanceof View) {
        /* eslint new-cap: 0 */
        var viewOptions = _.omit(_.extend({}, this.options, extraOptions), 'el');
        args[0] = new view(viewOptions);
        return this.add.apply(this, args);
      }

      // prevent dups
      if (_.isNumber(getIndex(this, view))) {
        throw new Error('Duplicate child');
      }

      view[PARENT] = this;

      // make the view responsible for adding itself to the parent:
      // * register the selector in the closure
      // * register a reference the parent in the closure
      view[ADD_TO_CONTAINER] = (function (selector) {
        return function () {
          if (selector && view[PARENT].$(selector).length != 1) {
            throw new Error('Invalid selector: ' + selector);
          }
          var $el = selector ? this[PARENT].$(selector) : this[PARENT].$el;
          this.render();
          // we need to delegate events in case
          // the view was added and removed before
          this.delegateEvents();

          // this[PARENT].at(index).$el.before(this.el);
          prepend ? $el.prepend(this.el) : $el.append(this.el);
        };
      }).call(view, selector);

      // if flag to bubble events is set
      // proxy all child view events
      if (bubble) {
        this.listenTo(view, 'all', function () {
          this.trigger.apply(this, arguments);
        });
      }

      // add to the dom if `render` has been called
      if (this.rendered()) {
        view[ADD_TO_CONTAINER]();
      }

      // add view to child views collection
      this[CHILDREN].push(view);

      return this;

    },

    /**
    * Remove all children from container
    */
    removeChildren: function () {
      this.each(function (view) {
        view.remove();
      });
      return this;
    },

    /**
    *  Removes a view from the DOM, and calls stopListening to remove any bound events that the view has listenTo'd.
    *  Also removes all childern of the view if any, and removes itself from its parent view(s)
    */
    remove: function () {
      this.removeChildren();
      if (this[PARENT]) {
        this[PARENT].unregister(this);
      }
      return Backbone.View.prototype.remove.apply(this, arguments);
    },

    /**
     * Compile the template to function you can apply tokens on on render time.
     * Uses the underscore tempalting engine by default
     * @protected
     * @param  {String} template
     * @return {Function} a compiled template
     */
    compileTemplate: function (template) {
      /* eslint  okta/no-specific-methods: 0*/
      return _.template(template);
    },

    /**
     * Render a template with `this.model` and `this.options` as parameters
     * preferring the model over the options.
     *
     * @param  {(String|Function)} template The template to build
     * @return {String} An HTML string
     * @protected
     */
    renderTemplate: function (template) {
      if (_.isString(template)) {
        template = this.compileTemplate(template);
      }
      if (_.isFunction(template)) {
        return template(this.getTemplateData());
      }
    },

    /**
     * The data hash passed to the compiled template
     * @return {Object}
     * @protected
     */
    getTemplateData: function () {
      var modelData = this.model && this.model.toJSON({verbose: true}) || {};
      var options = _.omit(this.options, ['state', 'settings', 'model', 'collection']);
      return _.defaults({}, modelData, options);
    },

    /**
    * Renders the template to `$el` and append all children in order
    * {@link #template View.template}
    */
    render: function () {
      this.preRender();
      doRender(this);
      this.postRender();
      return this;
    },

    /**
     * Pre render routine. Will be called right *before* the logic in {@link #render} is executed
     * @method
     */
    preRender: noop,

    /**
     * Post render routine. Will be called right *after* the logic in {@link #render} is executed
     * @method
     */
    postRender: noop,

    /**
     * Was this instance rendered
     */
    rendered: function () {
      return this[RENDERED];
    },

    /**
     * get all direct child views.
     *
     * ```javascript
     * var container = View.extend({
     *   children: [View1, View2]
     * }).render();
     * container.getChildren() //=> [view1, view2];
     * ```
     *
     * @return {Archer.View[]}
     */
    getChildren: function () {
      return this.toArray();
    },

    /**
    * Get a child by index
    * @param {number} index
    * @returns {Archer.View} The child view
    */
    at: function (index) {
      return this.getChildren()[index];
    },

    /**
    * Invokes a method on all children down the tree
    *
    * @param {String} method The method to invoke
    */
    invoke: function (methodName) {
      var args = _.toArray(arguments);
      this.each(function (child) {
        // if child has children, bubble down the tree
        if (child.size()) {
          child.invoke.apply(child, args);
        }
        // run the function on the child
        if (_.isFunction(child[methodName])) {
          child[methodName].apply(child, args.slice(1));
        }
      });
      return this;
    }
  });

  // Code borrowed from Backbone.js source
  // Underscore methods that we want to implement on the Container.
  var methods = ['each', 'map', 'reduce', 'reduceRight', 'find', 'filter', 'reject', 'every',
    'some', 'contains', 'toArray', 'size', 'first', 'initial', 'rest', 'last', 'without',
    'indexOf', 'shuffle', 'lastIndexOf', 'isEmpty', 'chain', 'where', 'findWhere'];

  _.each(methods, function (method) {
    View.prototype[method] = function () {
      var args = _.toArray(arguments);
      args.unshift(_.toArray(this[CHILDREN]));
      return _[method].apply(_, args);
    };
  }, this);

  return View;


  /**
   * @method each
   * @param {Function} iterator
   * @param {Object} [context]
   * See [_.each](http://underscorejs.org/#each)
   */
  /**
   * @method map
   * @param {Function} iterator
   * @param {Object} [context]
   * See [_.map](http://underscorejs.org/#map)
   */
  /**
   * @method reduce
   * @param {Function} iterator
   * @param {Mixed} memo
   * @param {Object} [context]
   * See [_.reduce](http://underscorejs.org/#reduce)
   */
  /**
   * @method reduceRight
   * @param {Function} iterator
   * @param {Mixed} memo
   * @param {Object} [context]
   * See [_.reduceRight](http://underscorejs.org/#reduceRight)
   */
  /**
   * @method find
   * @param {Function} predicate
   * @param {Object} [context]
   * See [_.find](http://underscorejs.org/#find)
   */
  /**
   * @method filter
   * @param {Function} predicate
   * @param {Object} [context]
   * See [_.filter](http://underscorejs.org/#filter)
   */
  /**
   * @method reject
   * @param {Function} predicate
   * @param {Object} [context]
   * See [_.reject](http://underscorejs.org/#reject)
   */
  /**
   * @method every
   * @param {Function} [predicate]
   * @param {Object} [context]
   * See [_.every](http://underscorejs.org/#every)
   */
  /**
   * @method some
   * @param {Function} [predicate]
   * @param {Object} [context]
   * See [_.some](http://underscorejs.org/#some)
   */
  /**
   * @method contains
   * @param {Mixed} value
   * See [_.contains](http://underscorejs.org/#contains)
   */
  /**
   * @method toArray
   * See [_.toArray](http://underscorejs.org/#toArray)
   */
  /**
   * @method size
   * See [_.size](http://underscorejs.org/#size)
   */
  /**
   * @method first
   * @param {Number} [n]
   * See [_.first](http://underscorejs.org/#first)
   */
  /**
   * @method initial
   * @param {Number} [n]
   * See [_.initial](http://underscorejs.org/#initial)
   */
  /**
   * @method last
   * @param {Number} [n]
   * See [_.last](http://underscorejs.org/#last)
   */
  /**
   * @method rest
   * @param {Number} [index]
   * See [_.rest](http://underscorejs.org/#rest)
   */
  /**
   * @method without
   * See [_.without](http://underscorejs.org/#without)
   */
  /**
   * @method indexOf
   * @param {Mixed} value
   * @param {Boolean} [isSorted]
   * See [_.indexOf](http://underscorejs.org/#indexOf)
   */
  /**
   * @method shuffle
   * See [_.shuffle](http://underscorejs.org/#shuffle)
   */
  /**
   * @method lastIndexOf
   * @param {Mixed} value
   * @param {Number} [fromIndex]
   * See [_.shuffle](http://underscorejs.org/#lastIndexOf)
   */
  /**
   * @method isEmpty
   * See [_.isEmpty](http://underscorejs.org/#isEmpty)
   */
  /**
   * @method chain
   * See [_.chain](http://underscorejs.org/#chain)
   */
  /**
   * @method where
   * @param {Object} properties
   * See [_.where](http://underscorejs.org/#where)
   */
  /**
   * @method findWhere
   * @param {Object} properties
   * See [_.findWhere](http://underscorejs.org/#findWhere)
   */


}));
