define([
  './BaseSearchableSelect'
], function (BaseSearchableSelect) {

  return BaseSearchableSelect.extend({

    getSelectizeOption: function () {
      var value = this.getModelValue();
      
      return {
        items: value ? [value] : [],
        create: false,
        maxItems: 1,
        onDropdownOpen: this.handleFooter.bind(this)
      };
    },
    
    toStringValue: function () {
      var value = this.getModelValue();
      return this.getOptionString(value) || this.defaultValue();
    }

  });

});
