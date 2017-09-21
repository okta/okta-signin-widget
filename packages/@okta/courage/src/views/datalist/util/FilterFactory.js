/* eslint max-params: [2, 8]*/
define([
  'okta/underscore',
  'backbone',
  'shared/util/Logger',
  'shared/util/StringUtil',
  'shared/views/forms/BaseForm',
  'shared/views/datalist/Sidebar',
  'shared/views/datalist/SidebarFilterSet',
  'shared/views/datalist/components/SidebarFilter'
],
function (_, Backbone, Logger, StringUtil, BaseForm, Sidebar, SidebarFilterSet, SidebarFilter) {

  function normalize(label, value) {
    var count;
    if (_.isArray(label)) {
      var params = label;
      value = params[0];
      label = params[1];
      count = params[2];
    }
    return {
      label: label,
      value: value,
      count: count
    };
  }

  /**
   * @class FilterFactory
   * A factory method wrapper for creating sidebar filter navigation
   */

  return {

    /**
     * Creates a data sidebar with filter sets
     * @static
     * @param  {Object[]} filters filters definitions
     * @return {Sidebar} a Sidebar prototype
     */
    createFilters: function (filters) {
      var factory = this;
      return Sidebar.extend({
        initialize: function () {
          _.each(filters, function (options) {
            if (_.isFunction(options) || (_.isObject(options) && options instanceof Backbone.View)) {
              return this.add(options); // passthrough for pre-defined views
            }
            switch (options.type) {
            case 'form':
              return this.add(factory.__createFilterForm(options));
            default:
              Logger.warn('a type should be specified for filters');
              /* jshint -W086 */
              /* eslint-disable-line no-fallthrough */
            case 'filterset':
              return this.add(factory.__createFilterSet(options));
            }
          }, this);
        }
      });
    },

    /**
     * Creates a BaseForm tailored for Filtering
     * @private
     * @static
     * @param  {Object} options form and inputs definitions
     * @return {BaseForm} a BaseForm prototype
     */
    __createFilterForm: function (options) {

      if (!_.isUndefined(options.useApplyButton)) {
        options.noButtonBar = !options.useApplyButton;
      }

      options = _.extend({

        className: 'data-list-sidebar data-list-sidebar-filter-form',

        noCancelButton: true,

        autoBind: true,

        save: StringUtil.localize('datalist.apply_filter', 'courage'),

        noButtonBar: true,

        constructor: function (opts) {
          // mimic state
          opts.model = opts.state.clone();
          BaseForm.call(this, opts);

          // disable when search box used
          this.autoBind && this.listenTo(this.state, 'change:search', this.toggle);

          // handle events based on save button visibility
          var eventName = options.noButtonBar ? 'change' : 'save';
          var eventSrc = options.noButtonBar ? this.model : this;
          this.listenTo(eventSrc, eventName, function (model) {
            this.state.set(model.toJSON());
          });
        },

        render: function () {
          BaseForm.prototype.render.apply(this, arguments);
          this.autoBind && this.toggle();
          return this;
        },

        toggle: function () {
          return this.state.get('search') ? this.disable() : this.enable();
        }

      }, options);

      // inputs should have label on top in side bar
      options.inputs = _.map(options.inputs, function (input) {
        return _.extend({'label-top': true}, input);
      });

      // return the BaseForm
      return BaseForm.extend(options);
    },

    // Exposing private methods externally for tests
    /**
     * Creates a SidebarFilterSet
     * @private
     * @static
     * @param  {Object} options options hash
     * @param  {String} filters.className The class for the filter set
     * @param  {String} filters.label The label for the filter set
     * @param  {String} filters.field The state field this filter-set operates on
     * @param  {String} [filters.autoBind] should the filter-set "disable" and reset when the "search" field is changed
     * @param  {Object} filters.attributes The attributes for the filter set
     * @param  {Object} filters.options a value -> label set of filters
     * @return {SidebarFilterSet} The SidebarFilterSet
     */
    __createFilterSet: function (options) {
      var className = SidebarFilterSet.prototype.className;
      if (!_.isEmpty(options.className)) {
        className = className + ' ' + options.className;
      }
      var attributes = _.extend({}, SidebarFilterSet.prototype.attributes, options.attributes);
      return SidebarFilterSet.extend({
        className: className,
        title: options.label,
        attributes: attributes,
        autoBind: !_.isUndefined(options.autoBind) ? options.autoBind : SidebarFilterSet.prototype.autoBind,
        initialize: function () {
          _.each(_.result(options, 'options'), function (value, key) {
            var params = normalize(value, key);
            this.add(SidebarFilter, 'ul', {options: {
              field: options.field,
              label: params.label,
              value: params.value,
              count: params.count
            }});
          }, this);
        }
      });
    }

  };



});
