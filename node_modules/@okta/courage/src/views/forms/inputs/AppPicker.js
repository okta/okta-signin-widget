define([
  'okta/underscore',
  './BaseSelectize'
], function (_, BaseSelectize) {

  return BaseSelectize.extend({

    apiURL: '/apps/find',
    nameAttribute: 'displayName',
    retrieveLimit: 20,

    parse: function (row) {
      return _.object(['displayName', 'id', 'logo', 'name'], row.split('|'));
    },

    parseAll: function (data) {
      if (_.isArray(data)) {
        return _.flatten(_.map(data, this.parseAll));
      } else if (_.isString(data)) {
        return _.map(data.split(/[\n\r]/), this.parse);
      } else {
        return data;
      }
    },

    buildPrefetchQuery: function (ids) {
      return {
        ids: ids.join(','),
        limit: ids.length // limit parameter is mandatory
      };
    }

  });

});
