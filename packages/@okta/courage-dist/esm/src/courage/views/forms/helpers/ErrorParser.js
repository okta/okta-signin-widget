import oktaUnderscore from '../../../util/underscore-wrapper.js';
import StringUtil from '../../../util/StringUtil.js';

const FIELD_REGEX = /^([\S]+): (.+)$/;
var ErrorParser = {
  /**
   * Helper function that returns the json output of an xhr objext
   * @param  {jqXhr} xhr
   * @return {Object}
   */
  getResponseJSON: function (xhr) {
    try {
      return xhr.responseJSON || JSON.parse(xhr.responseText);
    } catch (e) {// ignore error
    }
  },

  /**
   * Parses an error summary to extract a field name and an error message
   * @param  {String} errorSummary The raw error summary
   * @return {String[]} An array with two members: [field name, error message]
   */
  parseErrorSummary: function (errorSummary) {
    const matches = errorSummary.match(FIELD_REGEX); // error format is: `fieldName: The field cannot be left blank`

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
      const localizedMsg = StringUtil.localize(errorCause.reason);
      const apiMsg = errorCause.errorSummary;
      const field = errorCause.property;
      const errorMessage = localizedMsg.indexOf('L10N_ERROR[') === -1 ? localizedMsg : apiMsg;
      return [field, errorMessage];
    }
  },
  parseErrors: function (resp) {
    const responseJSON = this.getResponseJSON(resp);
    return oktaUnderscore.map(responseJSON && responseJSON.errorCauses || [], function (errorCause) {
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
    const responseJSON = this.getResponseJSON(resp);
    const errors = {}; // xhr error object

    if (responseJSON) {
      /* eslint complexity: [2, 9] */
      oktaUnderscore.each(responseJSON.errorCauses || [], function (cause) {
        let res = [];

        if (cause.property && cause.errorSummary) {
          res = this.parseErrorCauseObject(cause);
        } else if (cause.location && cause.errorSummary) {
          // To handle new api error format for field level errors.
          // Ignoring the reason attribute as the translation happens in the API layer and not in the client any more.
          res = [cause.location, cause.errorSummary];
        } else {
          res = this.parseErrorSummary(cause && cause.errorSummary || '');
        }

        if (res) {
          const fieldName = res[0];
          const message = res[1];
          errors[fieldName] || (errors[fieldName] = []);
          errors[fieldName].push(message);
        }
      }, this);
    } // validation key/value object
    else if (oktaUnderscore.isObject(resp) && oktaUnderscore.size(resp)) {
      oktaUnderscore.each(resp, function (msg, field) {
        errors[field] = [msg];
      });
    }

    return oktaUnderscore.size(errors) ? errors : undefined;
  }
};

export { ErrorParser as default };
