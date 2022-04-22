import oktaUnderscore from '../util/underscore-wrapper.js';
import Backbone from '../vendor/lib/backbone.js';

var CHILDREN = '__children__';
var RENDERED = '__rendered__';
var PARENT = '__parent__';
var CHILD_DEFINITIONS = '__children_definitions__';
var ADD_TO_CONTAINER = '__add_to_container__';

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
  } else if (view.length) {
    view.$el.empty();
  }

  view.each(function (view) {
    view[ADD_TO_CONTAINER]();
  });
}

function subscribeEvents(view) {
  var isEventPropertyRe = /^(?!(?:delegate|undelegate|_))([a-zA-Z0-9]+)(?:Events)$/;

  oktaUnderscore.each(oktaUnderscore.allKeys(view), function (key) {
    var matchKeys = key.match(isEventPropertyRe);

    if (!matchKeys) {
      return;
    }

    var bindings = oktaUnderscore.result(view, key);

    var entity = view.options[matchKeys[1]] || view[matchKeys[1]];

    if (!entity || !oktaUnderscore.isObject(bindings) || !oktaUnderscore.isFunction(entity.trigger)) {
      return;
    }

    oktaUnderscore.each(bindings, function (callback, event) {
      var callbacks = oktaUnderscore.isFunction(callback) ? [callback] : oktaUnderscore.reduce(callback.split(/\s+/), (arr, name) => {
        if (oktaUnderscore.isFunction(view[name])) {
          arr.push(view[name]);
        }

        return arr;
      }, []);

      oktaUnderscore.each(callbacks, function (cb) {
        view.listenTo(entity, event, cb);
      });
    });
  });
}
/**
   * A View operates on a string template, an token based template, or a model based template, with a few added hooks.
   * It provides a collection of child views, when a child view could be a View or another View.
   * Conceptually, if we were in a file system, the View is a folder, when the concrete child views are files,
   * and the child Views are sub folders.
   *
   * *Technically, when using a View as a container, it could have its own concrete logic,
   * but conceptually we like to keep it separated so a view is either a concrete view or a collection of child views.*
   *
   * In addition to the standard backbone options, we added `settings` and `state` as first class options.
   * it will automatically assign `options` to `this.options` as an instance member.
   *
   * See [Backbone.View](http://backbonejs.org/#View).
   *
   * @class src/framework/View
   * @extends external:Backbone.View
   * @param {Object} [options] options hash
   * @example
   * var DocumentView = Archer.View.extend({
   *   template: [
   *     '<header></header>',
   *     '<article></article>',
   *     '<footer></footer>'
   *   ].join(''),
   *   children: [[HeaderView, 'header'], [ContentView, 'article'], [FooterView, 'footer']]
   * });
   */


let View;
const proto = {
  /**
     * An object listing events and callback bind to this.{entity}
     * @name *Events
     * @memberof src/framework/View
     * @type {(Object|Function)}
     * @instance
     * @example
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
     */
  preinitialize: function (options) {
    /* eslint max-statements: [2, 17] */
    this.options = options || {};

    oktaUnderscore.extend(this, oktaUnderscore.pick(this.options, 'state', 'settings')); // init per-instance children collection


    this[CHILDREN] = [];
    this[RENDERED] = false;
    this[PARENT] = null;
    this[CHILD_DEFINITIONS] = this.children; // we want to make sure initialize is triggered *after* we append the views from the `this.views` array
    // FIXME:
    // It's actually can be done by override initialize method
    //  initialize() { run extra login; super.initialize(); }
    // BUT the problem is child classes would override initialize without invoke super.
    // hence we have to also looking into (refactoring) ALL child classes.

    this.__original_initialize__ = this.initialize;
    this.initialize = noop;
  },
  constructor: function (options, ...rest) {
    Backbone.View.call(this, options);

    oktaUnderscore.each(oktaUnderscore.result(this, CHILD_DEFINITIONS), function (childDefinition) {
      this.add.apply(this, oktaUnderscore.isArray(childDefinition) ? childDefinition : [childDefinition]);
    }, this);

    delete this[CHILD_DEFINITIONS];

    const autoRender = oktaUnderscore.result(this, 'autoRender');

    if (autoRender && this.model) {
      var event = oktaUnderscore.isArray(autoRender) ? oktaUnderscore.map(autoRender, function (field) {
        return 'change:' + field;
      }).join(' ') : 'change';
      this.listenTo(this.model, event, function () {
        this.render();
      });
    }

    this.initialize = this.__original_initialize__;
    this.initialize.call(this, options, ...rest); // initialize in child class may have any number of parameters

    subscribeEvents(this);
  },

  /**
     * Unregister view from container
     * Note: this will not remove the view from the dom
     * and will not call the `remove` method on the view
     *
     * @param {src/framework/View} view the view to unregister
     * @private
     */
  unregister: function (view) {
    this.stopListening(view);
    var viewIndex = getIndex(this, view); // viewIndex is undefined when the view is not found (may have been removed)
    // check if it is undefined to prevent unexpected thing to happen
    // array.splice(undefined, x) removes the first x element(s) from the array
    // this protects us against issues when calling `remove` on a child view multiple times

    if (oktaUnderscore.isNumber(viewIndex)) {
      this[CHILDREN].splice(viewIndex, 1);
    }
  },

  /**
     * Should we auto render the view upon model change. Boolean or array of field names to listen to.
     * @type {Boolean|Array}
     * @deprecated Instead, please use modelEvents
     * @example
     * modelEvents: {
     *   change:name: 'render'
     * }
     */
  autoRender: false,

  /**
     *
     * When the template is an underscore template, the render method will pass the options has to the template
     * And the associated model, if exists, when it will prefer the model over the options in case of a conflict.
     * {@link #render View.render}
     * @type {(String|Function)}
     * @example
     * var View = View.extend({
     *   template: '<p class="name">{{name}}</p>'
     * };
     */
  template: null,

  /**
     * A list of child view definitions to be passed to {@link #add this.add()}.
     * Note: these definitions will be added **before** the {@link #constructor initiliaze} method invokes.
     * @type {(Array|Function)}
     * @example
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
     */
  children: [],

  /**
     * Add a child view to the container.
     * If the container is already rendered, will also render the view  and append it to the DOM.
     * Otherwise will render and append once the container is rendered.
     *
     * *We believe that for the sake of encapsulation, a view should control its own chilren, so we treat this method as
     * protected and even though technically you can call `view.add` externally we strongly discourage it.*
     *
     * @param {(src/framework/View|String)} view A class (or an instance which is discouraged) of a View - or an HTML
     * string/template
     * @param {String} [selector] selector in the view's template on which the view will be added to
     * @param {Object} [options]
     * @param {Boolean} [options.bubble=false] Bubble (proxy) events from this view up the chain
     * @param {Boolean} [options.prepend=false] Prepend the view instend of appending
     * @param {String} [options.selector] Selector in the view's template on which the view will be added to
     * @param {Object} [options.options] Extra options to pass to the child constructor
     * @protected
     * @returns {src/framework/View} - The instance of itself for the sake of chaining
     * @example
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
     */
  add: function (view, selector, bubble, prepend, extraOptions) {
    /* eslint max-statements: [2, 30], complexity: [2, 12] */
    var options = {};

    var args = oktaUnderscore.toArray(arguments); // This will throw if a compiled template function is passed accidentally


    if (oktaUnderscore.isFunction(view) && (!view.prototype || !view.prototype.render)) {
      throw new Error('Type passed to add() is not a View');
    }

    if (oktaUnderscore.isObject(selector)) {
      options = selector;
      selector = options.selector;
      bubble = options.bubble;
      prepend = options.prepend;
      extraOptions = options.options;
    } else if (oktaUnderscore.isObject(bubble)) {
      options = bubble;
      bubble = options.bubble;
      prepend = options.prepend;
      extraOptions = options.options;
    } // TODO: This will be deprecated at some point. Views should use precompiled templates


    if (oktaUnderscore.isString(view)) {
      view = function (template) {
        return View.extend({
          constructor: function () {
            try {
              var $el = Backbone.$(template);

              if ($el.length !== 1) {
                throw new Error('invalid Element');
              }

              var unescapingRexExp = /&(\w+|#x\d+);/g;
              var elementUnescapedOuterHTMLLength = $el.prop('outerHTML').replace(unescapingRexExp, ' ').length;
              var templateUnescapedLength = template.replace(unescapingRexExp, ' ').length;

              if (elementUnescapedOuterHTMLLength !== templateUnescapedLength) {
                throw new Error('invalid Element');
              }

              this.template = $el.html(); // Template string will be compiled by handlebars

              this.el = $el.empty()[0];
            } catch (e) {
              // not a valid html tag.
              this.template = template;
            }

            View.apply(this, arguments);
          }
        });
      }(view);
    }

    if (view.prototype && view.prototype instanceof View) {
      /* eslint new-cap: 0 */
      var viewOptions = oktaUnderscore.omit(oktaUnderscore.extend({}, this.options, extraOptions), 'el');

      args[0] = new view(viewOptions);
      return this.add.apply(this, args);
    } // prevent dups


    if (oktaUnderscore.isNumber(getIndex(this, view))) {
      throw new Error('Duplicate child');
    }

    view[PARENT] = this; // make the view responsible for adding itself to the parent:
    // * register the selector in the closure
    // * register a reference the parent in the closure

    view[ADD_TO_CONTAINER] = function (selector) {
      return function () {
        if (selector && view[PARENT].$(selector).length !== 1) {
          throw new Error('Invalid selector: ' + selector);
        }

        var $el = selector ? this[PARENT].$(selector) : this[PARENT].$el;
        this.render(); // we need to delegate events in case
        // the view was added and removed before

        this.delegateEvents(); // this[PARENT].at(index).$el.before(this.el);

        prepend ? $el.prepend(this.el) : $el.append(this.el);
      };
    }.call(view, selector); // if flag to bubble events is set
    // proxy all child view events


    if (bubble) {
      this.listenTo(view, 'all', function () {
        this.trigger.apply(this, arguments);
      });
    } // add to the dom if `render` has been called


    if (this.rendered()) {
      view[ADD_TO_CONTAINER]();
    } // add view to child views collection


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
  // TODO: This will be deprecated at some point. Views should use precompiled templates
  compileTemplate: function (template) {
    /* eslint  @okta/okta-ui/no-specific-methods: 0*/
    return oktaUnderscore.template(template, undefined);
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
    if (oktaUnderscore.isString(template)) {
      // TODO: This will be deprecated at some point. Views should use precompiled templates
      template = this.compileTemplate(template);
    }

    if (oktaUnderscore.isFunction(template)) {
      return template(this.getTemplateData());
    }
  },

  /**
     * The data hash passed to the compiled template
     * @return {Object}
     * @protected
     */
  getTemplateData: function () {
    var modelData = this.model && this.model.toJSON({
      verbose: true
    }) || {};

    var options = oktaUnderscore.omit(this.options, ['state', 'settings', 'model', 'collection']);

    return oktaUnderscore.defaults({}, modelData, options);
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
     * Get all direct child views.
     * @returns {src/framework/View[]}
     * @example
     * var container = View.extend({
     *   children: [View1, View2]
     * }).render();
     * container.getChildren() //=> [view1, view2];
     */
  getChildren: function () {
    return this.toArray();
  },

  /**
     * Get a child by index
     * @param {number} index
     * @returns {src/framework/View} The child view
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
    var args = oktaUnderscore.toArray(arguments);

    this.each(function (child) {
      // if child has children, bubble down the tree
      if (child.size()) {
        child.invoke.apply(child, args);
      } // run the function on the child


      if (oktaUnderscore.isFunction(child[methodName])) {
        child[methodName].apply(child, args.slice(1));
      }
    });
    return this;
  }
};
View = Backbone.View.extend(
/** @lends src/framework/View.prototype */
proto); // Code borrowed from Backbone.js source
// Underscore methods that we want to implement on the Container.

var methods = ['each', 'map', 'reduce', 'reduceRight', 'find', 'filter', 'reject', 'every', 'some', 'contains', 'toArray', 'size', 'first', 'initial', 'rest', 'last', 'without', 'indexOf', 'shuffle', 'lastIndexOf', 'isEmpty', 'chain', 'where', 'findWhere'];

oktaUnderscore.each(methods, function (method) {
  View.prototype[method] = function () {
    var args = oktaUnderscore.toArray(arguments);

    args.unshift(oktaUnderscore.toArray(this[CHILDREN]));
    return oktaUnderscore[method].apply(oktaUnderscore, args);
  };
}, undefined);
/**
   * See [_.each](http://underscorejs.org/#each)
   * @name each
   * @memberof src/framework/View
   * @method
   * @instance
   * @param {Function} iterator
   * @param {Object} [context]
   */

/**
   * See [_.map](http://underscorejs.org/#map)
   * @name map
   * @memberof src/framework/View
   * @method
   * @instance
   * @param {Function} iterator
   * @param {Object} [context]
   */

/**
   * See [_.reduce](http://underscorejs.org/#reduce)
   * @name reduce
   * @memberof src/framework/View
   * @method
   * @instance
   * @param {Function} iterator
   * @param {Mixed} memo
   * @param {Object} [context]
   */

/**
   * See [_.reduceRight](http://underscorejs.org/#reduceRight)
   * @name reduceRight
   * @memberof src/framework/View
   * @method
   * @instance
   * @param {Function} iterator
   * @param {Mixed} memo
   * @param {Object} [context]
   */

/**
   * See [_.find](http://underscorejs.org/#find)
   * @name find
   * @memberof src/framework/View
   * @method
   * @instance
   * @param {Function} predicate
   * @param {Object} [context]
   */

/**
   * See [_.filter](http://underscorejs.org/#filter)
   * @name filter
   * @memberof src/framework/View
   * @method
   * @instance
   * @param {Function} predicate
   * @param {Object} [context]
   */

/**
   * See [_.reject](http://underscorejs.org/#reject)
   * @name reject
   * @memberof src/framework/View
   * @method
   * @instance
   * @param {Function} predicate
   * @param {Object} [context]
   */

/**
   * See [_.every](http://underscorejs.org/#every)
   * @name every
   * @memberof src/framework/View
   * @method
   * @instance
   * @param {Function} [predicate]
   * @param {Object} [context]
   */

/**
   * See [_.some](http://underscorejs.org/#some)
   * @name some
   * @memberof src/framework/View
   * @method
   * @instance
   * @param {Function} [predicate]
   * @param {Object} [context]
   */

/**
   * See [_.contains](http://underscorejs.org/#contains)
   * @name contains
   * @memberof src/framework/View
   * @method
   * @instance
   * @param {Mixed} value
   */

/**
   * See [_.toArray](http://underscorejs.org/#toArray)
   * @name toArray
   * @memberof src/framework/View
   * @method
   * @instance
   */

/**
   * See [_.size](http://underscorejs.org/#size)
   * @name size
   * @memberof src/framework/View
   * @method
   * @instance
   */

/**
   * See [_.first](http://underscorejs.org/#first)
   * @name first
   * @memberof src/framework/View
   * @method
   * @instance
   * @param {Number} [n]
   */

/**
   * See [_.initial](http://underscorejs.org/#initial)
   * @name initial
   * @memberof src/framework/View
   * @method
   * @instance
   * @param {Number} [n]
   */

/**
   * See [_.last](http://underscorejs.org/#last)
   * @name last
   * @memberof src/framework/View
   * @method
   * @instance
   * @param {Number} [n]
   */

/**
   * See [_.rest](http://underscorejs.org/#rest)
   * @name rest
   * @memberof src/framework/View
   * @method
   * @instance
   * @param {Number} [index]
   */

/**
   * See [_.without](http://underscorejs.org/#without)
   * @name without
   * @memberof src/framework/View
   * @method
   * @instance
   */

/**
   * See [_.indexOf](http://underscorejs.org/#indexOf)
   * @name indexOf
   * @memberof src/framework/View
   * @method
   * @instance
   * @param {Mixed} value
   * @param {Boolean} [isSorted]
   */

/**
   * See [_.shuffle](http://underscorejs.org/#shuffle)
   * @name shuffle
   * @memberof src/framework/View
   * @method
   * @instance
   */

/**
   * See [_.shuffle](http://underscorejs.org/#lastIndexOf)
   * @name lastIndexOf
   * @memberof src/framework/View
   * @method
   * @instance
   * @param {Mixed} value
   * @param {Number} [fromIndex]
   */

/**
   * See [_.isEmpty](http://underscorejs.org/#isEmpty)
   * @name isEmpty
   * @memberof src/framework/View
   * @method
   * @instance
   */

/**
   * See [_.chain](http://underscorejs.org/#chain)
   * @name chain
   * @memberof src/framework/View
   * @method
   * @instance
   */

/**
   * See [_.where](http://underscorejs.org/#where)
   * @name where
   * @memberof src/framework/View
   * @method
   * @instance
   * @param {Object} properties
   */

/**
   * See [_.findWhere](http://underscorejs.org/#findWhere)
   * @name findWhere
   * @memberof src/framework/View
   * @method
   * @instance
   * @param {Object} properties
   */

/**
 * It's used for distinguishing the ambiguity from _.isFunction()
 * which returns True for both a JavaScript Class constructor function
 * and normal function. With this flag, we can tell a function is actually
 * a View Class.
 * This flag is added in order to support the type of a parameter can be
 * either a Class or pure function that returns a Class.
 */


View.isCourageView = true;
var FrameworkView = View;

export { FrameworkView as default };
