/* eslint max-params: [2, 7]*/
define([
  'okta/underscore',
  './util/DatalistFactory',
  './util/ToolbarFactory',
  './util/FilterFactory',
  './DataList',
  './Content',
  './Table'
],
function (_, DatalistFactory, ToolbarFactory, FilterFactory, DataList, Content, Table) {


  // high order function for composition
  function add(component, options, index) {
    if (_.isUndefined(index)) {
      index = this[component].length;
    }
    this[component].splice(index, 0, options);
  }

  /**
   * @class Okta.DataList
   * @extends DataList
   *
   * A simplified version of the data-list pattern.
   * It lets you:
   *
   * - define columns via the {@link #columns} array or the {@link #addColumn} hook.
   * - define toolbar items via the {@link #toolbar} array or the {@link #addToolbarComponent} hook.
   * - define filters via the {@link #filters} array or the {@link #addFilterSet} hook.
   *
   * ```javascript
   * Okta.DataList.extend({
   *   columns: [
   *     {
   *       label: 'First Name',
   *       template: '{{fname}}'
   *     },
   *     {
   *       label: 'Last Name',
   *       field: 'lname' // identical to template: '{{lname}}'
   *     },
   *     {
   *       label: 'Actions',
   *       actions: [{
   *         title: 'Remove',
   *         icon: 'remove-16-color',
   *         visible: true,
   *         enableWhen: {
   *           fname: function (fname) {
   *             return fname.indexOf('admin') < 0;
   *           }
   *         },
   *         click: function () {}
   *       }, {
   *         title: 'Edit',
   *         icon: 'edit-16',
   *         enabled: true,
   *         visibleWhen: {
   *           permissions: function (perms) {
   *             return _.contains(perms, 'edit');
   *           }
   *         },
   *         click: function () {}
   *       }]
   *     }
   *   ],
   *
   *   filters: [
   *     {
   *       type: 'form',
   *       title: 'Title',
   *       inputs: [
   *         {
   *           type: 'select',
   *           label: 'Status',
   *           name: 'status',
   *           options; {
   *             'ACTIVE': 'Active',
   *             'INACTIVE': 'Inactive'
   *           }
   *         },
   *         {
   *           type: 'radio',
   *           label: 'Status',
   *           name: 'status',
   *           options: {
   *             'ACTIVE': 'Active',
   *             'INACTIVE': 'Inactive'
   *           }
   *         }
   *       ]
   *     },
   *     {
   *        type: 'filterset',
   *        label: Status,
   *        field: 'status',
   *        options: {
   *          'ACTIVE': 'Active',
   *          'INACTIVE': 'Inactive'
   *        }
   *     },
   *     {
   *        type: 'filterset',
   *        label: 'Status',
   *        field: 'status',
   *        options: {
   *          ['ACTIVE', 'Active'],  // identical to 'ACTIVE': 'Active'
   *          ['INACTIVE', 'Inactive', 11]
   *        }
   *     }
   *   ],
   *
   *   toolbar: [
   *      {
   *        type: 'search',
   *        field: 'q'
   *      },
   *      {
   *        type: 'letters',
   *        field: 'prefix'
   *      },
   *      {
   *        // takes same params as button
   *        type: 'button',
   *        title: 'Add Stuff',
   *        icon: 'add-16-thin',
   *        className: 'foo',
   *        click: function () {
   *          // do stuff
   *        }
   *      }
   *    ]
   * });
   * ```
   */

  /**
   * @cfg {Object} column
   * A column Definition
   *
   * @cfg {String} [column.name]
   * The name of the column in the model.
   * Will attempt to use the name as a localization key when a label is not present
   *
   * @cfg {String} [column.label]
   * The column's label
   *
   * @cfg {String} [column.template]
   * An optional template to render in the table cell. the default is the column's value
   *
   * @cfg {String} [column.view]
   * An optional sub view to render in the table cell
   *
   * @cfg {String} [column.headerView]
   * An optional sub view to render in the table header cell
   *
   * @cfg {String} [column.className]
   * A class name to attach to the cell
   *
   * @cfg {Object} [column.events]
   * Backbone events hash to apply on the column view
   *
   * @cfg {Function} [column.initialize]
   * Backbone initialize method to apply on the column view
   *
   * @cfg {Object[] | Function} [column.actions]
   * An array of {@link #action} configurations rendered in the column, which generates a {@link Okta.DropDown} if
   * _visible_ actions length is larger than _threshold_ (default 2), otherwise {@link BaseButtonLink}
   *
   * @cfg {Number} [column.threshold]
   * column.actions will be converted to a {@link Okta.DropDown} if actions length is larger
   * than this value, for {@link #action} only, default to 2
   *
   * @cfg {String|Function} [column.dropdown.title]
   * The options.title in {@link Okta.DropDown}, for {@link #action} only, default to 'Actions'
   *
   * @cfg {Number|Function} [column.dropdown.width]
   * The options.width in {@link Okta.DropDown}, for {@link #action} only
   *
   * @cfg {Boolean|Function} [column.dropdown.itemWidth]
   * The options.itemWidth in {@link Okta.DropDown}, for {@link #action} only, default to 180
   *
   * @cfg {String|Function} [column.dropdown.icon]
   * The options.icon in {@link Okta.DropDown}, the icon of the top item in a DropDown, for {@link #action} only
   *
   * @cfg {Boolean|Function} [column.dropdown.disabled]
   * The options.disabled in {@link Okta.DropDown}, for {@link #action} only, default to false
   *
   */

  /**
    * @cfg {Object} action
    * An array of action configurations rendered in the column
    *
    * @cfg  {String} [action.title]
    * The button/action text, if the action is a {@link BaseButtonLink}, _title_ won't be shown if _icon_ exists
    *
    * @cfg  {String} [action.icon]
    * CSS class for the icon to display. See [Style guide](http://rain.okta1.com:1802/su/dev/style-guide#icons)
    *
    * @cfg {Function} [action.click]
    * On click callback
    *
    * @cfg {Object} [action.events]
    * a [Backbone events](http://backbonejs.org/#View-delegateEvents) hash
    *
    * @cfg {Boolean | Function} [action.enabled]
    * To enable/disable the action, default to true
    *
    * @cfg {Boolean | Function} [action.visible]
    * To show/hide the action, default to true
    *
    * @cfg {Object} [action.enableWhen]
    * To enable/disable the action per binding model's value
    *
    * @cfg {Object} [action.showWhen]
    * To show/hide the action per binding model's value
    */

  /**
   * @cfg {Object} component
   * A Toolbar Component Definition
   *
   * @cfg {String} [component.type]
   * The type of the component.
   * Available values are `button`, `search` and `letters`
   *
   * @cfg {String} [component.align=left]
   * How to align the component
   * Available values are `left` and `right`
   *
   * @cfg {String} [component.field]
   * What field this component manipulates. Applies to `search` and `letters`
   *
   * @cfg {String} [component.icon]
   * Icon css className. Applies to `button`
   *
   * @cfg {String} [component.title]
   * the Title. Applies to `button`
   *
   * @cfg {Function} [component.click]
   * Click callback function. Applies to `button`
   *
   * @cfg {String} [component.href]
   * Link href. Applies to `button`
   */

  /**
   * @cfg {Object} filter
   * A Filter Set Component Definition
   *
   * @cfg {String} [filter.type]
   * - 'form': Add a Form to the Sidebar by using the fields specified in the
   * {@link Okta.Form} documentation.
   * - 'filterset': utilize the 'label', 'field', and 'options' properties below
   *
   * @cfg {String} [filter.label]
   * The label of the filter set.
   *
   * @cfg {String} [filter.field]
   * What field this filter set manipulates.
   *
   * @cfg {Object|Array} [filter.options]
   * - Either A key/value (value/label) set of available filter options.
   * - Or array of [value, label(, count)]
   */

  /**
   * @property {Okta.View} [header] @inheritdoc Archer.TableView#property-header
   */

  /**
   * @property {Okta.View} [footer] @inheritdoc Archer.TableView#property-footer
   */

  /**
   * @property {Okta.View} [caption] @inheritdoc Archer.TableView#property-caption
   */

  /**
   * @property {Okta.View} [item] @inheritdoc Archer.ListView#property-item
   */

  /**
   * @property {Okta.View} [Empty] @inheritdoc Content#property-Empty
   */

  /**
   * @property {Okta.View} [Loading] @inheritdoc Content#property-Loading
   */

  return DataList.extend({

    attributes: {
      'data-se': 'data-list'
    },


    /**
     * @property {Object} [emptyState] Empty state `title` and `subtitle`
     * @property {String|Function} [emptyState.title]
     * @property {String|Function} [emptyState.subtitle]
     * @property {Boolean|Function} [emptyState.escape]
     */
    emptyState: {
      title: undefined,
      subtitle: undefined,
      escape: undefined
    },

    /**
     * @property {Object[]} [columns] An array of column configurations to render in the data list
     * @type {Array}
     */
    columns: [],

    /**
     * @property {Object[]} [toolbar] An array of toolbar component configurations to add to the top toolbar
     * @type {Array}
     */
    toolbar: [],

    /**
     * Should we place the toolbar inside the content area
     * @type {Boolean}
     */
    innerToolbar: false,

    /**
     * @property {Object[]} [filters] An array of filter configurations to render on the side bar
     * @type {Array}
     */
    filters: [],

    /**
     * @method
     * Add a column to the data list
     * @param {Object} column The column to add
     * @param {Number} [index] The index where to add the column
     */
    addColumn: _.partial(add, '__columns'),

    /**
     * @method
     * Add a component to the toolbar
     * @param {Object} component The component to add
     * @param {Number} [index] The index where to add the component in the toolbar
     */
    addToolbarComponent: _.partial(add, '__toolbar'),

    /**
     * @method
     * Add a filter set to the side bar
     * @param {Object} filter The filter set options to add
     * @param {Number} [index] The index where to add the filter set in the side bar
     */
    addFilterSet: _.partial(add, '__filters'),

    __processActions: function (column) {
      if (!_.isObject(column) || _.isArray(column)) {
        return column; // a column could be simply a string.
      }
      var col = _.omit(column, 'actions'),
          colOptions = _.pick(column, 'dropdown', 'threshold');
      if (column.actions) {
        col.view = DatalistFactory.createActions(_.result(column, 'actions'), colOptions);
      }
      return col;
    },

    constructor: function () {
      // create instance level arrays to avoid isntances referring to the same prototype arrays
      this.__toolbar = _.clone(this.toolbar || []);
      this.__filters = _.clone(this.filters || []);
      this.__columns = _.clone(this.columns || []);

      DataList.apply(this, arguments);
    },

    render: function () {
      /* eslint max-statements: 0, complexity: 0 */
      this.removeChildren();


      if (this.__toolbar.length) {
        this.Toolbar = ToolbarFactory.createToolbar(this.__toolbar);
      }
      if (this.Toolbar && !this.innerToolbar) {
        this.Toolbar && this.add(this.Toolbar);
      }

      if (this.__filters.length) {
        this.Sidebar = FilterFactory.createFilters(this.__filters);
      }
      this.Sidebar && this.add(this.Sidebar);

      var localColumns = _.map(this.__columns, this.__processActions);

      this.add(Content.extend({
        Toolbar: this.innerToolbar && this.Toolbar,
        Main: Table.extend({
          attributes: {
            'data-se': 'data-list-table'
          },
          columns: localColumns,
          item: this.item,
          header: this.header,
          caption: this.caption,
          footer: this.footer
        }),
        Empty: this.Empty || DatalistFactory.createEmptyView(this.emptyState),
        Loading: this.Loading
      }));

      DataList.prototype.render.apply(this, arguments);
      return this;
    }
  });

});
