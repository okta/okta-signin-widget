define([
  'okta/underscore',
  './BasePicker'
], function (_, BasePicker) {

  return BasePicker.extend({

    apiURL: '/report/app_instance_autocomplete',

    nameAttribute: 'displayName',

    parse: function (row) {
      return _.object(['displayName', 'id', 'name', 'status'], row.split('|'));
    },

    parseAll: function (data) {
      return _.isString(data) ? _.map(data.split(/[\n\r]/), this.parse) : data;
    },

    buildPrefetchQuery: function () {
      return {limit: 50}; // limit parameter is mandatory
    }

  });

});
