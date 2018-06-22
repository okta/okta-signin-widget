define([
  'okta/underscore',
  'okta/jquery',
  'shared/util/TemplateUtil',
  './BasePicker',
  'selectize'
],
function (_, $, TemplateUtil, BasePicker) {

  function getMaxItems(view) {
    if (isSingle(view)) {
      return 1;
    }
    else {
      return view.getAttribute('selectionLimit') || Infinity;
    }
  }

  function isSingle(view) {
    return _.contains(['string', 'number', 'boolean'], getType(view));
  }

  function getType(view) {
    var fieldName = view.options.name,
        model = view.model,
        schema = model.getPropertySchema && model.getPropertySchema(fieldName) || {};
    return schema.type;
  }

  var BaseSelectize = BasePicker.extend({

    /**
     * @property {String} itemTempalte
     * A tempalte for each items selected in the autosuggest box
     */

    /**
     * @property {String} optionTempalte
     * A tempalte for each option in the dropdown
     */

    /**
     * @property {String|Array} searchField
     * Fields in the parsed results to search for string matches
     */

    /**
     * @property {Boolean} canCreate
     * Allow create arbitrary item when it's not from predefined option list.
     */

    template: TemplateUtil.tpl('<select name="{{name}}" id="{{inputId}}"></select>'),

    height: null,

    to: function (values) {
      return isSingle(this) ? (values || [])[0] || null : values;
    },

    from: function (value) {
      return isSingle(this) ? (value ? [value] : []) : value;
    },

    _autoSuggest: function () {
      /* eslint complexity: 0 */

      var self = this,
          params = this.options.params || {},
          xhr;

      var options = {

        plugins: !isSingle(this) && ['remove_button'] || [],

        preload: isSingle(this) ? this.getAttribute('preload', false) : false,

        create: this.getAttribute('canCreate', false),
        openOnFocus: !_.isUndefined(params.openOnFocus) ? params.openOnFocus : false,
        hideSelected: !_.isUndefined(params.hideSelected) ? params.hideSelected : true,
        closeAfterSelect: !_.isUndefined(params.closeAfterSelect) ? params.closeAfterSelect : true,

        loadThrottle: 200,

        maxOptions: this.getAttribute('retrieveLimit', Infinity),
        maxItems: getMaxItems(this),

        labelField: this.nameAttribute,
        valueField: this.idAttribute,

        // XXX: field(s) for local filtering - Could possibly automatge and take from the model
        searchField: this.getAttribute('searchField', this.nameAttribute),

        placeholder: this.options.placeholder,

        onFocus: function () {
          if (isSingle(self) && this.isFull()) {
            this.clearOptions();
            var value = self._entities[0];
            self.removeEntity(value[self.idAttribute]);
            this.removeItem(this.getItem(value));
          }
        },

        onItemAdd: function (value, $item) {
          self.addEntity($item, this.options[value]);
        },

        onItemRemove: function (value) {
          _.defer(this.close.bind(this));
          self.removeEntity(value);
          self.$(':input').focus();
        },

        load: function (query, callback) {
          /* eslint max-statements: [2, 11] */
          xhr && xhr.abort();

          var data = _.clone(self.extraParams || {}),
              limit = self.getAttribute('retrieveLimit');

          if (_.isArray(data)) {
            data.push({name: self.queryParam, value: query});
            if (limit) {
              data.push({name: 'limit', value: limit});
            }
          }
          else {
            data[self.queryParam] = query;
            if (limit) {
              data.limit = limit;
            }
          }

          xhr = $.ajax({
            url: self.apiURL,
            data: data,
            type: 'GET',
            error: function () {
              callback();
            },
            success: function (res) {
              callback(self.parseAll(res));
            }
          });
        },

        render: {}

      };

      // add `itemTemplate` and `optionTemplate` to the render ruotine
      ['option', 'item'].forEach(function (key) {
        var template = this.getAttribute(key + 'Template');
        if (template) {
          options.render[key] = TemplateUtil.tpl(template);
        }
      }, this);

      var $input = this.$(':input');

      $input.selectize(options);

      var widget = this.widget = $input[0].selectize;

      // adapter method to play with BasePicker
      widget.addInitialSelection = function (item, id) {
        widget.addOption(item);
        widget.addItem(id);
      };

      return widget;
    }

  });

  return BaseSelectize;

});
