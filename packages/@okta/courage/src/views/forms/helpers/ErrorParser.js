define(['okta/underscore', 'shared/util/StringUtil'], function (_, StringUtil) {

  var FIELD_REGEX = /^([\S]+)\: (.+)$/;

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
      var matches = errorSummary.match(FIELD_REGEX);
      if (matches) {
        return [matches[1], matches[2]];
      }
    },

    /**
     * Parses an error cause object to extract a field name from property attribute
     * and an error message form errorSummary attribute. It looks to see if there is
     * a custom override/translation for the erorrCause.reason before using the errorSummary
     * @param  {Object} errorCause object
     * @return {String[]} An array with two members: [field name, error message]
     */
    parseErrorCauseObject: function (errorCause) {
      if (errorCause.property && errorCause.errorSummary) {
        var localizedMsg = StringUtil.localize(errorCause.reason),
            apiMsg = errorCause.errorSummary,
            field = errorCause.property,
            errorMessage = localizedMsg.indexOf('L10N_ERROR[') === -1 ? localizedMsg : apiMsg;
        return [field, errorMessage];
      }
    },

    parseErrors: function (resp) {
      var responseJSON = this.getResponseJSON(resp);
      return _.map(responseJSON && responseJSON.errorCauses || [], function (errorCause) {
        return ('' + errorCause.errorSummary).replace(FIELD_REGEX, '$2');
      });
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
          var res = [];
          if (cause.property && cause.errorSummary) {
            res = this.parseErrorCauseObject(cause);
          } else {
            res = this.parseErrorSummary(cause && cause.errorSummary || '');
          }
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
