(function (root, factory) {
  if (typeof define == 'function' && define.amd) {
    define(['okta/underscore', './View', './ListView', './TableFactory'], factory);
  }
  /* global module, exports */
  else if (typeof require == 'function' && typeof exports == 'object') {
    var table = factory(
      require('okta/underscore'),
      require('./View'), require('./ListView'),
      require('./TableFactory')
    );
    module.exports = table;
  }
  else {
    root.Archer.TableView = factory(root._, root.Archer.View, root.Archer.ListView, root.Archer.TableFactory);
  }
}(this, function (_, BaseView, ListView, TableFactory) {

  var tagMap = {
    header: 'thead',
    footer: 'tfoot',
    caption: 'caption'
  };
  var metaViews = {};

  /**
   * Adds a section (header/footer/section) to the table view
   * it will find the matching property on the table instance, normalize it, and add it as child view.
   *
   * @param {Archer.TableView} target
   * @param {String} name section name
   *
   * ```javascript
   * addSection(table, 'header');
   * ```
   */
  function addSection(target, name) {
    var Section = target[name];
    if (Section) {
      if (name == 'header' && _.isArray(Section)) {
        Section = TableFactory.createHeader(_.map(Section, function (field) {
          return _.isString(field) ? {label: field} : (_.isFunction(field) ? {headerView: field} : field);
        }));
      }
      else if (_.isString(Section)) {
        Section = BaseView.extend({
          tagName: tagMap[name],
          template: Section
        });
      }
      var view = target.add(Section, {prepend: true}).last();
      metaViews[view.cid] = true;
    }
  }

  /**
   * checks if a given array of object has at least one of the properties asked for.
   *
   * ```javascript
   * has([{foo: 1}], 'foo'); // => true
   * has([{foo: 1}, {foo: 1}], 'foo'); // => true
   * has([{foo: 1}, {foo: 1}, {foo: 1}], 'bar'); // => false
   * has([{foo: 1}, {foo: 1}, {bar: 1}], 'bar', 'baz'); // => true
   * has([{foo: 1}, {foo: 1}, {foo: 1}], 'baz', 'qux'); // => false
   * ```
   */
  function has(columns) {
    var fields = Array.prototype.splice.call(arguments, 1);
    return _.reduce(fields, function (memo, field) {
      return memo + _.compact(_.pluck(columns, field)).length;
    }, 0) > 0;
  }

  /**
   * Archer.TableView is a special ListView that implements an HTML table
   * @class src/framework/TableView
   * @extends src/framework/ListView
   * @param {Object} options options hash
   * @param {Object} options.collection The collection which this view operates on
   * @example
   * var UserTable = Archer.TableView.extend({
   *   columns: [
   *     {
   *       label: 'First Name',
   *       field: 'fname'
   *     },
   *     {
   *       label: 'Last Name',
   *       field: 'lname'
   *     }
   *   ]
   * });
   *
   * var users = new Archer.Collection([
   *   {fname: 'John', lname: 'Doe'},
   *   {fname: 'Jane', lname: 'Doe'}
   * ]);
   *
   * var userTable = new UserTable({collection: users});
   * userTable.render();
   */
  return ListView.extend(/** @lends src/framework/TableView.prototype */ {

    constructor: function () {
      /* eslint max-statements: [2, 11]*/
      this.tagName = 'table';

      var columns = _.result(this, 'columns') || [];
      if (columns.length) {
        if (!this.header && has(columns, 'label', 'headerView')) {
          this.header = TableFactory.createHeader(columns);
        }
        if (!this.item) {
          this.item = TableFactory.createRow(columns);
        }
      }

      ListView.apply(this, arguments);

      addSection(this, 'caption');
      addSection(this, 'footer');
      addSection(this, 'header');
    },

    /**
     * Definition of a the table in a column based prespective.
     * @property {Array|Function} [columns]
     * @property {String} [columns.label] The heading label of the column
     * @property {Archer.View} [columns.headerView] The heading label view of the column (overrides `label`)
     * @property {String} [columns.name] The name of model field to render. Equals to `template: {{fieldName}}`
     * @property {String} [columns.template] The template to render for this column (overrides `name`)
     * @property {Archer.View} [columns.view] A custom view to render for this column (overrides `name` and `template`)
     * @property {Object} [columns.events] A event hash for this column
     * @example
     * var UserTable = Archer.TableView.extend({
     *   columns: [
     *     {
     *       label: 'First Name',
     *       field: 'fname'
     *     },
     *     {
     *       label: 'Last Name',
     *       field: 'lname'
     *     }
     *   ]
     * });
     */
    columns: [],

    /**
     *  The table header
     *
     * - If set as an {@link Archer.View}, it's `tagName` needs to be a `thead`
     * - If set as a string, it needs to be a valid html `tr` block
     * - If set as an array, the markup will be generated automagically
     *
     * See:
     * - [http://www.w3.org/wiki/HTML/Elements/thead](http://www.w3.org/wiki/HTML/Elements/thead)
     * - [http://www.w3.org/wiki/HTML/Elements/tr](http://www.w3.org/wiki/HTML/Elements/tr)
     * - [http://backbonejs.org/#View](http://backbonejs.org/#View)
     *
     * @type {module:Okta.View|String|Array}
     * @example
     * // These examples will result in identical outcomes
     * var UserList = Archer.TableView.extend({
     *   header: Archer.View.extend(
     *     tagName: 'thead',
     *     template: '\
     *       <tr>\
     *         <th>First Name</th>\
     *         <th>Last Name</th>\
     *         <th>Email Address</th>\
     *       </tr>\
     *    '
     * });
     *
     * var UserList = Archer.TableView.extend({
     *   header: '\
     *     <tr>\
     *       <th>First Name</th>\
     *       <th>Last Name</th>\
     *       <th>Email Address</th>\
     *     </tr>\
     *  '
     * });
     *
     * var UserList = Archer.TableView.extend({
     *   header: ['First Name', 'Last Name', 'Email Address']
     * });
     */
    header: null,

    /**
     * The table footer
     *
     * - If set as a {@link Archer.View}, it's `tagName` needs to be a `tfoot`
     * - If set as a string, it needs to be a valid html `tr` block
     *
     * See:
     * - [http://www.w3.org/wiki/HTML/Elements/table](http://www.w3.org/wiki/HTML/Elements/table)
     * - [http://backbonejs.org/#View](http://backbonejs.org/#View)
     *
     * @type {module:Okta.View|String}
     * @example
     * var UserList = Archer.TableView.extend({
     *   footer: Archer.View.extend(
     *     tagName: 'tfoot',
     *     template: '\
     *       <tr>\
     *         <th>First Name</th>\
     *         <th>Last Name</th>\
     *         <th>Email Address</th>\
     *       </tr>\
     *    '
     * });
     *
     * var UserList = Archer.TableView.extend({
     *   footer: '\
     *     <tr>\
     *       <th>First Name</th>\
     *       <th>Last Name</th>\
     *       <th>Email Address</th>\
     *     </tr>\
     *  '
     * });
     */
    footer: null,

    /**
     * The table caption.
     *
     * We don't use an actual html `caption` tag, to get more flexibility we define the caption as a special row, that
     * stays static below the header for the lifespan of the table view life cycle.
     *
     * See:
     * - [http://www.w3.org/wiki/HTML/Elements/table](http://www.w3.org/wiki/HTML/Elements/table)
     * - [http://backbonejs.org/#View](http://backbonejs.org/#View)
     *
     * @type {module:Okta.View|String}
     * @example
     * var UserList = Archer.TableView.extend({
     *   caption: 'LIST OF USERS'
     * });
     *
     * var UserList = Archer.TableView.extend({
     *   caption: Archer.View.extend(
     *     tagName: 'caption',
     *     template: 'LIST OF USERS'
     *   })
     * });
     *
     * // or it could technically also be a tbody
     * var UserList = Archer.TableView.extend({
     *   caption: Archer.View.extend(
     *     tagName: 'tbody',
     *     template: '<tr><td colspan="100">My Custom Caption</td></tr>'
     *   })
     * });
     */
    caption: null,

    removeChildren: function () {
      this.each(function (view) {
        if (!metaViews[view.cid]) {
          view.remove();
        }
      });
      return this;
    }
  });

}));
