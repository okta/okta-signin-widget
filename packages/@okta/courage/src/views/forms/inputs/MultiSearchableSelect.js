define([
  'okta/underscore',
  './BaseSearchableSelect',
], function (_, BaseSearchableSelect) {

  return BaseSearchableSelect.extend({

    getSelectizeOption: function () {
      var value = this.getModelValue(),
          maxOptions = this.getParamOrAttribute('maxOptions'),
          selectOptions = this.selectOptions;

      return {
        options: selectOptions,
        placeholder: this.options.placeholder,
        preload: true,
        create: false,
        maxOptions: maxOptions,
        labelField: 'value',
        valueField: 'key',
        searchField: ['value'],
        items: _.isArray(value) ? value : [],
        maxItems: null,
        plugins: ['remove_button'],
        onItemRemove: function () {
          _.defer(this.close.bind(this));
        },
        onType: this.handleFooter.bind(this),
        // show suggestion only when user types.
        // will follow up with UX to see what could be better.
        closeAfterSelect: false,
        openOnFocus: true,
        onDropdownOpen: null
      };
    },

    toStringValue: function () {
      var value = this.getModelValue();
      var values = _.isArray(value) ? value : [value];

      values = _.map(values, function (v) {
        return this.options.options[v];
      }, this);

      return values.join(', ') || this.defaultValue();
    }

  });
});
