define([
  './BasePicker'
],
function (BasePicker) {
  return BasePicker.extend({
    initialize: function () {
      this.apiURL = this.apiURL + this.model.get('type');
    },
    apiURL: '/api/internal/v1/social_scopes/',
    arbitrary: true,

    prefetch: function (success) {
      var ids = this.model.get('protocol.scopes') || [];
      success(ids);
    },
    parse: function (item) {
      return {id: item, name: item};
    }
  });

});