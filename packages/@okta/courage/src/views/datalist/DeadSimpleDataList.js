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
   * A simplified version of the data-list pattern. It lets you:
   * - define columns via the {@link #columns} array or the {@link #addColumn} hook.
   * - define toolbar items via the {@link #toolbar} array or the {@link #addToolbarComponent} hook.
   * - define filters via the {@link #filters} array or the {@link #addFilterSet} hook.
   * @class module:Okta.DataList
   * @extends src/views/datalist/DataList
   * @borrows src/framework/TableView#header as #header
   * @borrows src/framework/TableView#footer as #footer
   * @borrows src/framework/TableView#caption as #caption
   * @borrows src/framework/ListView#item as #item
   * @borrows src/views/datalist/Content#Empty as #Empty
   * @borrows src/views/datalist/Content#Loading as #Loading
   * @example
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
   */

  /**
   * A Column definition
   * @typedef {Object} column
   * @memberof module:Okta.DataList
   *
   * @property {String} [column.name]
   * The name of the column in the model. Will attempt to use the name as a
   * localization key when a label is not present.
   *
   * @property {String} [column.label]
   * The column's label
   *
   * @property {String} [column.template]
   * An optional template to render in the table cell. the default is the column's value
   *
   * @property {String} [column.view]
   * An optional sub view to render in the table cell
   *
   * @property {String} [column.headerView]
   * An optional sub view to render in the table header cell
   * 
   * @property {Object} [column.headAttributes]
   * An optional object that contains attributes for column header like colspan, rowspan
   *
   * @property {String} [column.className]
   * A class name to attach to the cell
   *
   * @property {Number|Function} [column.maxWidth]
   * Sets the column max-width in pixels, and use an ellipsis ("...")
   * to represent the clipped text, hover on the cell will show all text
   *
   * @property {Object} [column.events]
   * Backbone events hash to apply on the column view
   *
   * @property {Function} [column.initialize]
   * Backbone initialize method to apply on the column view
   *
   * @property {module:Okta.DataList.action[]|Function} [column.actions]
   * An array of {@link module:Okta.DataList.action|action} configurations rendered
   * in the column, which generates a {@link module:Okta.DropDown|DropDown} if
   * _visible_ actions length is larger than _threshold_ (default 2), otherwise
   * {@link module:Okta.internal.views.components.BaseButtonLink|BaseButtonLink}
   *
   * @property {Number} [column.threshold]
   * column.actions will be converted to a {@link module:Okta.DropDown|DropDown}
   * if actions length is larger than this value, for {@link module:Okta.DataList.action|action}
   * only, default to 2
   *
   * @property {String|Function} [column.dropdown.title]
   * The options.title in {@link module:Okta.DropDown|DropDown}, for
   * {@link module:Okta.DataList.action|action} only, default to 'Actions'
   *
   * @property {Number|Function} [column.dropdown.width]
   * The options.width in {@link module:Okta.DropDown|DropDown}, for
   * {@link module:Okta.DataList.action|action} only
   *
   * @property {Boolean|Function} [column.dropdown.itemWidth=180]
   * The options.itemWidth in {@link module:Okta.DropDown|DropDown}, for
   * {@link module:Okta.DataList.action|action} only, default to 180
   *
   * @property {String|Function} [column.dropdown.icon]
   * The options.icon in {@link module:Okta.DropDown|DropDown}, the icon of the
   * top item in a DropDown, for {@link module:Okta.DataList.action|action} only
   *
   * @property {Boolean|Function} [column.dropdown.disabled=false]
   * The options.disabled in {@link module:Okta.DropDown|DropDown}, for
   * {@link module:Okta.DataList.action|action} only, default to false
   */

  /**
   * An array of action configurations rendered in the column
   * @typedef {Object} action
   * @memberof module:Okta.DataList
   *
   * @property  {String} [action.title]
   * The button/action text, if the action is a {@link BaseButtonLink}, _title_
   * won't be shown if _icon_ exists
   *
   * @property  {String} [action.icon]
   * CSS class for the icon to display. See [Style guide](http://rain.okta1.com:1802/su/dev/style-guide#icons)
   *
   * @property {Function} [action.click]
   * On click callback
   *
   * @property {Object} [action.events]
   * a [Backbone events](http://backbonejs.org/#View-delegateEvents) hash
   *
   * @property {Boolean|Function} [action.enabled]
   * To enable/disable the action, default to true
   *
   * @property {Boolean|Function} [action.visible]
   * To show/hide the action, default to true
   *
   * @property {Object} [action.enableWhen]
   * To enable/disable the action per binding model's value
   *
   * @property {Object} [action.showWhen]
   * To show/hide the action per binding model's value
   */

  /**
   * A Toolbar Component Definition
   * @typedef {Object} component
   * @memberof module:Okta.DataList
   *
   * @property {String} [component.type]
   * The type of the component. Available values are `button`, `search` and `letters`
   *
   * @property {String} [component.align=left]
   * How to align the component. Available values are `left` and `right`
   *
   * @property {String} [component.field]
   * What field this component manipulates. Applies to `search` and `letters`
   *
   * @property {String} [component.icon]
   * Icon css className. Applies to `button`
   *
   * @property {String} [component.title]
   * the Title. Applies to `button`
   *
   * @property {Function} [component.click]
   * Click callback function. Applies to `button`
   *
   * @property {String} [component.href]
   * Link href. Applies to `button`
   */

  /**
   * A Filter Set Component Definition
   * @typedef {Object} filter
   * @memberof module:Okta.DataList
   *
   * @property {String} [filter.type]
   * - `form`: Add a Form to the Sidebar by using the fields specified in the
   * {@link module:Okta.Form|Form} documentation.
   * - `filterset`: utilize the 'label', 'field', and 'options' properties below
   *
   * @property {String} [filter.label]
   * The label of the filter set.
   *
   * @property {String} [filter.field]
   * What field this filter set manipulates.
   *
   * @property {Object|Array} [filter.options]
   * - Either A key/value (value/label) set of available filter options.
   * - Or array of [value, label(, count)]
   */

  return DataList.extend(/** @lends module:Okta.DataList.prototype */ {

    attributes: {
      'data-se': 'data-list'
    },

    /**
     * Empty state `title` and `subtitle`
     * @type {Object}
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
     * LoadMore View
     * @type {module:Okta.View}
     */
    LoadMoreView: undefined,

    /**
     * An array of column configurations to render in the data list
     * @type {module:Okta.DataList.column[]}
     */
    columns: [],

    /**
     * An array of toolbar component configurations to add to the top toolbar
     * @type {module:Okta.DataList.component[]}
     */
    toolbar: [],

    /**
     * Should we place the toolbar inside the content area
     * @type {Boolean}
     */
    innerToolbar: false,

    /**
     * An array of filter configurations to render on the side bar
     * @type {module:Okta.DataList.filter[]}
     */
    filters: [],

    /**
     * Add a column to the data list
     * @method
     * @param {module:Okta.DataList.column} column The column to add
     * @param {Number} [index] The index where to add the column
     */
    addColumn: _.partial(add, '__columns'),

    /**
     * Add a component to the toolbar
     * @method
     * @param {module:Okta.DataList.component} component The component to add
     * @param {Number} [index] The index where to add the component in the toolbar
     */
    addToolbarComponent: _.partial(add, '__toolbar'),

    /**
     * Add a filter set to the side bar
     * @method
     * @param {module:Okta.DataList.filter} filter The filter set options to add
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

      if (!this.footer && this.LoadMoreView) {
        this.footer = DatalistFactory.createFooterView(this.LoadMoreView);
      }

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
