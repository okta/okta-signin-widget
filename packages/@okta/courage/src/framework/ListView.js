(function (root, factory) {
  if (typeof define == 'function' && define.amd) {
    define(['okta/underscore', './View'], factory);
  }
  /* global module, exports */
  else if (typeof require == 'function' && typeof exports == 'object') {
    module.exports = factory(require('okta/underscore'), require('./View'));
  }
  else {
    root.Archer || (root.Archer = {});
    root.Archer.ListView = factory(root._, root.Archer.View);
  }
}(this, function (_, View) {
  /**
   * Archer.ListView is a {@link src/framework/View} that operates on a
   * collection and builds a list of "things" of the same type.
   *
   * Automagically adds, removes and sorts upon standard collection events.
   *
   * Listen to collection events so the ListView will do the right thing when
   * a model is added or the collection is reset or sorted.
   *
   * @class src/framework/ListView
   * @extends src/framework/View
   * @param {Object} options options hash
   * @param {Object} options.collection The collection which this view operates on
   * @example
   * var UserList = Archer.ListView.extend({
   *   tagName: 'ul',
   *   item: '<li>{{fname}} {{lname}}</li>'
   * });
   *
   * var users = new Archer.Collection([
   *   {fname: 'John', lname: 'Doe'},
   *   {fname: 'Jane', lname: 'Doe'}
   * ]);
   *
   * var userList = new UserList({collection: users}).render();
   * userList.el; //=> "<ul><li>John Doe</li><li>Jane Doe</li></ul>"
   *
   * users.push({fname: 'Jim', lname: 'Doe'});
   * userList.el; //=> "<ul><li>John Doe</li><li>Jane Doe</li><li>Jim Doe</li></ul>"
   *
   * users.first().destroy();
   * userList.el; //=> "<ul><li>Jane Doe</li><li>Jim Doe</li></ul>"
   */
  return View.extend(/** @lends src/framework/ListView.prototype */ {

    constructor: function () {
      View.apply(this, arguments);
      if (!this.collection) {
        throw new Error('Missing collection');
      }
      this.listenTo(this.collection, 'reset sort', this.reset);
      this.listenTo(this.collection, 'add', this.addItem);
      this.collection.each(this.addItem, this);
    },

    /**
     * The view/template we will use to render each model in the collection.
     * @type {String|module:Okta.View}
     */
    item: null,

    /**
     * A selector in the local template where to append each item
     * @type {String}
     */
    itemSelector: null,


    /**
     * Empty the list and re-add everything from the collection.
     * Usefull for handling `collection.reset()` or for handling the initial load
     * @protected
     */
    reset: function () {
      this.removeChildren();
      this.collection.each(this.addItem, this);
      return this;
    },

    /**
     * Add an item view to the list that will represent one model from the collection
     *
     * Listen to the model so when it is destoyed or removed from the collection
     * this item will remove itself from the list
     *
     * @param {Backbone.Model} model The model this row operates on
     * @protected
     */
    addItem: function (model) {
      var view = this.add(this.item, this.itemSelector, {options: {model: model}}).last();
      view.listenTo(model, 'destroy remove', view.remove);
      return this;
    }

  });

}));
