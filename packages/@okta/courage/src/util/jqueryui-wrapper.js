/* eslint okta/enforce-requirejs-names: 0, okta/no-specific-modules: 0 */
define(['okta/jquery', 'jqueryui'], function ($) {

  $.widget('ui.oktaAutocomplete', $.ui.autocomplete, {
    _renderItem: function (ul, item) {
      var template = this.options.itemTemplate;
      if (template) {
        return $(template(item)).appendTo(ul);
      }
      else {
        return this._super(ul, item);
      }
    }
  });

  $.widget('ui.oktaAutocompleteWithEmptyState', $.ui.oktaAutocomplete, {
    _renderItem: function (ul, item) {
      var template = this.options.noResultsTemplate;
      if (item.empty) {
        return $(template(item)).appendTo(ul);
      }
      else {
        return this._super(ul, item);
      }
    },
    options: {
      response: function (event, ui) {
        ui.content.length || ui.content.push({empty: true});
      }
    }
  });

});
