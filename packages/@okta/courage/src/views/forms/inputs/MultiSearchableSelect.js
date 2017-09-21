define([
  'okta/underscore',
  './BaseSearchableSelect',
], function (_, BaseSearchableSelect) {

  return BaseSearchableSelect.extend({

    getSelectizeOption: function () {
      var value = this.getModelValue(),
          selectOptions = this.selectOptions;

      var items = _.isArray(value) ? value : [];
      var canCreate = this.canCreateValue();
      
      // Selectize expects options corresponding to all the selected items
      // to be present. For the items created on fly, then might not be 
      // options corresponding to it so appending created options to the base
      // option.
      if (canCreate) {
        var userOptions = this.__getOptionsForCreatedItems(items);
        Array.prototype.push.apply(selectOptions, userOptions);
      }    
      
      return {
        options: selectOptions,
        create: canCreate,
        items: items,
        maxItems: null,
        plugins: ['remove_button'],
        onItemRemove: function () {
          _.defer(this.close.bind(this));
        },
        // show suggestion only when user types.
        // will follow up with UX to see what could be better.
        closeAfterSelect: false,
        openOnFocus: true,
        onDropdownOpen: null,
        createFilter: function (input) {
          if (!input) {
            return false;
          }

          var option = _.find(selectOptions, function (option) {
            return option['key'] === input;
          });

          return !option;
        }
      };
    },

    canCreateValue: function () {
      var create = this.getParam('create');
      
      if (_.isFunction(create)) {
        create = create.call(this);
      }

      return create;
    },

    toStringValue: function () {
      var value = this.getModelValue();
      var values = _.isArray(value) ? value : [value];

      values = _.map(values, function (v) {
        return this.getOptionString(v) || v;
      }, this);

      return values.join(', ') || this.defaultValue();
    },

    __getOptionsForCreatedItems: function (items) {
      var options = this.options.options,
          hasGroups = this.optGroups.length > 0,
          selectOptions = this.options.selectOptions;

      return _.reduce(items, function (output, value) {
        var selectedOption = options[value];
        
        if (!selectedOption && hasGroups) {
          selectedOption = _.find(selectOptions, function (option) {
            return option['key'] === value; 
          });
        }

        if (!selectedOption) {
          output.push({ key: value, value: value });
        }

        return output;
      }, []);
    }
  });
});
