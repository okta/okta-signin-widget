define(['okta/underscore'], function (_) {

  return {

    /**
     * Helper function that returns the json output of an xhr objext
     * @param  {jqXhr} xhr
     * @return {Object}
     */
    getResponseJSON: function (xhr) {
      try {
        return xhr.responseJSON || JSON.parse(xhr.responseText);
      }
      catch (e) {
        return;
      }
    },

    /**
     * Parses an error summary to extract a field name and an error message
     * @param  {String} errorSummary The raw error summary
     * @return {String[]} An array with two members: [field name, error message]
     */
    parseErrorSummary: function (errorSummary) {
      // error format is: `fieldName: The field cannot be left blank`
      var matches = errorSummary.match(/^([^\:]+)\: (.+)$/);
      if (matches) {
        return [matches[1], matches[2]];
      }
    },

    /**
     * Parses the response for errors
     * Returns a map of field names > array or error messages
     * Example:
     * ```javascript
     * {
     *   url: ['The field cannot be left blank', 'The field has to be a valid URI'],
     *   name: ['The field cannot be left blank']
     * }
     * ```
     * @param  {Object} resp
     * @return {Object}
     */
    parseFieldErrors: function (resp) {
      var responseJSON = this.getResponseJSON(resp),
          errors = {};

      // xhr error object
      if (responseJSON) {
        _.each(responseJSON.errorCauses || [], function (cause) {
          var res = this.parseErrorSummary(cause && cause.errorSummary || '');
          if (res) {
            var fieldName = res[0], message = res[1];
            errors[fieldName] || (errors[fieldName] = []);
            errors[fieldName].push(message);
          }
        }, this);
      }
      // validation key/value object
      else if (_.isObject(resp) && _.size(resp)) {
        _.each(resp, function (msg, field) {
          errors[field] = [msg];
        });
      }
      return _.size(errors) ? errors : undefined;
    }
  };

});
