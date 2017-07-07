define([
  './BasePicker'
], function (BasePicker) {

  return BasePicker.extend({
    apiURL: '/api/v1/idps',

    buildPrefetchQuery: function (id) {
      return {q: id[0], limit: 20};
    }
  });
});
