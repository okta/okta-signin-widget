define([
  'okta/underscore',
  'okta/jquery',
  '../BaseInput',
  'shared/util/TemplateUtil',
  'shared/util/StringUtil',
  'vendor/plugins/select2'
],
function (_, $, BaseInput, TemplateUtil, StringUtil) {
  var events = {
    'keyup': function (e) {
      e.stopPropagation();
    }
  };

  /**
  * @class BaseSelect
  * @extends BaseInput
  * @private
  * @deprecated use BasePicker with selectionLimit === 1 instead
  * An abstract input for API based select widgets
  * The difference between BaseSelect and our simple Select is that the first works
  * with remote data and have search in it, when the Select works with static data
  */

  return BaseInput.extend({

    template: TemplateUtil.tpl('<input name="{{name}}" id="{{inputId}}" type="hidden"></input>'),

    selectEmptyOptionTemplate: TemplateUtil.tpl('\
      <div class="empty-option""><p>{{i18n code="oform.baseselect.reset" bundle="messages"}}</p></div>\
    '),

    searchInfoMsgTemplate: TemplateUtil.tpl('<p>{{name}}</p>'),

    events: {},

    /**
     * @property {String} nameAttribute The name attribute to operate on
     */
    nameAttribute: 'name',

    /**
     * @property {Object} [extraParams={}] Extra query parameters to pass to the server
     */
    extraParams: {},

    /**
     * @property {String} apiURL The URL to the API endpoint
     */
    apiURL: null,

    /**
     * @property {String} [queryParam=q] The name of the "search" query parameter
     */
    queryParam: 'q',

    /**
     * @property {String} placeholder An initial value that is selected if no other selection is made
     */
    placeholder: undefined,

    /**
     * @property {String} dropdownCssClass A css class that is added to select2's dropdown container
     */
    dropdownCssClass: undefined,

    /**
     * @property {String/Function} formatNoMatches A string containing "No matches" message, or
     * a function that returns this msg/html.
     * @return {String} Message html or null/undefined to disable the message
     */
    formatNoMatches: StringUtil.localize('oform.baseselect.noresults', 'messages'),

    /**
     * @property {String/Function} formatSearching A string containing "Searching..." message,
     * or a function that returns the msg/html that is displayed while search is in progress
     * @return {String} Message html
     */
    formatSearching: StringUtil.localize('oform.baseselect.searching', 'messages'),

    /**
     * @property {String/Function} formatAjaxError A string containing "Loading Failed" message,
     * or a function used to render the message
     * @return {String} Message html
     */
    formatAjaxError: StringUtil.localize('oform.baseselect.ajax_error', 'messages'),

    /**
     * @property {String/Function} formatInputTooShort A string containing message
     * that is displayed when search term is empty/short,
     * or a function used to render the message
     * @return {String} Message html
     */
    formatInputTooShort: StringUtil.localize('oform.baseselect.short_input', 'messages'),


    constructor: function (options) {
      if (!this.apiURL) {
        throw new Error('apiURL not provided');
      }
      _.defaults(this.events, events);
      BaseInput.call(this, options);
      this.extraParams.filter = this.getParam('filter');
      this._entity = {};
      _.bindAll(this, 'buildQuery', 'parseAll', 'processResults', 'initSelection', 'selectEntity',
        'getNameValue', 'formatResult');
    },

    toStringValue: function () {
      return this._entity[this.nameAttribute] || this.defaultValue();
    },

    val: function () {
      return this._value;
    },

    focus: function () {
      _.defer(_.bind(function () {
        this.$('.select2-focusser').focus();
      }, this));
    },

    readMode: function () {
      this.$el.empty();
      this.prefetch(_.bind(function (data) {
        if (!data.length) {
          this._entity = {};
        } else {
          // prefetched data will always be an empty array or an array of 1
          this._entity = this.parse(_.first(data));
        }
        this.$el.html(this.getReadModeString());
        this.model.trigger('form:resize');
      }, this));
    },

    editMode: function () {
      this.$el.empty();
      BaseInput.prototype.editMode.apply(this, arguments);
      var widget = this._select2();
      widget.on('select2-selecting', this.selectEntity);
      this._prefill(widget);
    },

    /**
     * Launches the select2 widget
     * @private
     * @return {Object}
     */
    _select2: function () {
      /* eslint complexity: [2, 7]*/
      var options = {
        ajax: {
          url: this.apiURL,
          dataType: 'json',
          quietMillis: 100,
          data: this.buildQuery,
          results: this.processResults
        },
        width: this.options.params && _.resultCtx(this.options.params, 'width', this) ||
          _.result(this, 'width') || '100%',
        text: this.getNameValue,
        dropdownCssClass: this.options.params && _.resultCtx(this.options.params, 'dropdownCssClass', this) ||
          _.result(this, 'dropdownCssClass'),
        openOnEnter: true,
        formatResult: this.formatResult,
        formatSelection: this.formatSelection,
        formatNoMatches: this.formatNoMatches,
        formatSearching: this.formatSearching,
        formatAjaxError: this.formatAjaxError,
        initSelection: this.initSelection
      };
      this._emptyOption = {
        id: '', // requires id to be selected
        empty: true,
        name: this.options.placeholder || this.placeholder
      };
      this._noResultsMsg = {
        disabled: true,
        name: this.options.formatNoMatches || this.formatNoMatches
      };
      this._startTypingMsg = {
        disabled: true,
        name: this.options.formatInputTooShort || this.formatInputTooShort
      };
      return this.$('input').select2(options);
    },

    /**
     * Called when Select2 is created to allow the user to initialize the selection
     * based on the value of the element select2 is attached to.
     * Essentially this is an id->object mapping function.
     * @param {Object} $el element Select2 is attached to
     * @param {Function} callback function that should be called with the data object
     */
    initSelection: function ($el, callback) {
      if (this._entity && this._entity.id) {
        callback(this._entity);
      } else {
        callback(this._emptyOption);
      }
    },

    buildQuery: function (searchTerm) {
      var params = {};
      params[this.queryParam] = searchTerm;
      if (this.extraParams && !_.isEmpty(this.extraParams)) {
        _.extend(params, this.extraParams);
      }
      return params;
    },

    /**
     * @method processResults Function used to build the query results object from the ajax response
     * @param {Object} data Retrieved data
     * @param {Object} page Page number that was passed into the data function
     * @param {Object} query The query object used to request this set of results
     * @return {Object} Results object
     */
    processResults: function (data, page, query) {
      // We don't pass 'minimumInputLength: 1' in select2 options as there is no way to add _emptyOption
      // to the dropdown when the search term is an empty string
      // but we implement same behavior below by adding this._startTypingMsg
      // element and this._emptyOption when the search term is empty ""
      // The ajax request still happens though
      var results = [];
      if (query.term === '') {
        results = [this._startTypingMsg, this._emptyOption];
      } else {
        results = this.parseAll(data);
        if (results.length === 0) {
          results.push(this._noResultsMsg, this._emptyOption);
        } else {
          results.push(this._emptyOption);
        }
      }
      return {results: results};
    },

    /**
     * @method formatResult Function used to render a result that the user can select
     * @param {Object} entity the entity to present
     * @return {String} Html string, a DOM element, or a jQuery object that represents the result.
     */
    formatResult: function () {},

    /**
     * @method formatSelection Function used to render the current selection
     * @param {Object} entity the entity to present
     * @param {Object} jQuery wrapper of the node to which the selection should be appended
     * @return {String} Html string, a DOM element, or a jQuery object that renders the selection
     */
    formatSelection: function () {},

     /**
     * @method getNameValue A function that retrieves the text from a given entity
     * @param {Object} entity
     * @return {String}
     */
    getNameValue: function (entity) {
      return entity[this.nameAttribute];
    },

    /**
     * Parses a list of raw entities (from the server payload)
     * The base implementation uses {@link BaseSelect#parse} to parse each individual entity
     * @param  {Array} entities
     * @return {Array}
     */
    parseAll: function (entities) {
      return _.map(entities, this.parse);
    },

    /**
     * Parses an entity and normalize to an object we can later use in the widget
     * @param  {Object} entity
     * @return {Object}
     */
    parse: function (entity) {
      return entity;
    },

    /**
     * Prefill the widget with the saved data from the server.
     * We need to fetch the server in order to map ids to names
     *
     * @param {Object} widget The select2 widget
     * @private
     */
    _prefill: function (widget) {
      var self = this;
      this.disable();
      this.prefetch(function (data) {
        // prefetched data will always be an empty array or an array of 1
        data.length && (self._entity = self.parse(_.first(data)));
        widget.select2('val', self._entity);
        self.enable();
      }, _.bind(self.enable, self));
    },

    /**
     * Prefetch the existing value from the server (by id)
     * @param {Function} success The success callback function.
     * @param {Object} success.data The data returned by the API.
     * @param {Function} [error] The error callback function.
     */
    prefetch: function (success, error) {
      var id = this.getModelValue();
      if (!id) {
        success([]);
        return;
      }
      var xhr = $.get(this.apiURL, this.buildPrefetchQuery(id), success);
      if (error) {
        xhr.error(error);
      }
    },

    /**
     * Returns an object containing url parameters
     * @param {String} id The model value off the field associated with the input
     * @return {Object}
     */
    buildPrefetchQuery: function (id) {
      return _.extend({}, this.extraParams, {
        filter: 'id eq "' + id + '"'
      });
    },

    /**
     * Add an entity to the selection (and to the local registry)
     * This is called when the user selects an item from the dropdown.
     * @param {Object} event The event object contains the following custom properties:
     * @param {String} event.val The id of the highlighted choice object
     * @param {Object} event.choice The parsed entity about to be selected
     */
    selectEntity: function (event) {
      this._updateModel(event.choice);
    },

    _updateModel: function (entity) {
      this._entity = entity;
      this._value = entity.id;
      this.update();
    }

  });
});
