define([
  'okta/underscore'
], function (_) {

  return {
    redirect: function (url) {
      window.location = url;
    },

    reloadPage: function () {
      window.location.reload();
    },

    constantError: function (errorMessage) {
      return function () {
        throw new Error(errorMessage);
      };
    },

    /**
     * Simply convert an URL query key value pair object into an URL query string.
     * Remember NOT to escape the query string when using this util.
     * example:
     * input: {userId: 123, instanceId: undefined, expand: 'schema,app'}
     * output: '?userId=123&expand=schema,app'
     */
    getUrlQueryString: function (queries) {
      _.isObject(queries) || (queries = {});
      var queriesString = _.without(_.map(queries, function (value, key) {
        if (value !== undefined && value !== null) {
          return key + '=' + encodeURIComponent(value);
        }
      }), undefined).join('&');
      return _.isEmpty(queriesString) ? '' : '?' + queriesString;
    }
  };
});
