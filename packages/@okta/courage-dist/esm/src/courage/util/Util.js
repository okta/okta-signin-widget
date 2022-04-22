import oktaUnderscore from './underscore-wrapper.js';
import BaseView from '../views/BaseView.js';

var Util = {
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
    oktaUnderscore.isObject(queries) || (queries = {});

    const queriesString = oktaUnderscore.without(oktaUnderscore.map(queries, function (value, key) {
      if (value !== undefined && value !== null) {
        return key + '=' + encodeURIComponent(value);
      }
    }), undefined).join('&');

    return oktaUnderscore.isEmpty(queriesString) ? '' : '?' + queriesString;
  },
  isABaseView: function (obj) {
    return obj instanceof BaseView || obj.prototype instanceof BaseView || obj === BaseView;
  }
};

export { Util as default };
