define([
  './BaseSearchableSelect'
], function (BaseSearchableSelect) {

  return BaseSearchableSelect.extend({

    getSelectizeOption: function () {
      var value = this.getModelValue(),
          maxOptions = this.getParamOrAttribute('maxOptions'),
          selectOptions = this.selectOptions;

      return {
        options: selectOptions,
        items: value ? [value] : [],
        placeholder: this.options.placeholder,
        preload: true,
        create: false,
        maxOptions: maxOptions,
        maxItems: 1,
        labelField: 'value',
        valueField: 'key',
        searchField: ['value'],
        onType: this.handleFooter.bind(this),
        onDropdownOpen: this.handleFooter.bind(this)
      };
    }

  });

});
