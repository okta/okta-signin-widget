define(['okta/underscore'], function (_) {
  return {
    /*
     * Parses an error object or an error list
     * If both are provided, error object will be used
     *
     * options.errors is an array of {errorSummary:field: some error message}
     *   Note: this is also defined in com.saasure.core.framework.api.exception.error.ErrorCause
     *   Note2: field: is optional.
     *
     * options.errorObj is an error object
     *   { errorCode: string code that identifies the error,
     *     errorSummary: brief description of the error,
     *     errorLink: urlToAnErrorDoc(if any, if not it is the same as the errorCode),
     *     errorId: unique object identifier,
     *     errorCauses: [{errorSummary: cause1}, {errorSummary: cause2}]
     *    }
     *   Note: this is also defined in com.saasure.core.framework.api.exception.error.ApiErrorResponse
     *
     * options.inputMap is a map from field to actual name of the field.
     * e.g. {label: 'Tab Name'}
     */
    create: function (options) {
      // Use error causes from the error object if they are provided
      if (options && options.errorObj) {
        if (_.isEmpty(options.errorObj.errorCauses)) {
          // No error causes defined, just work with the errorSummary
          options.errors = [{errorSummary: options.errorObj.errorSummary}];
        }
        else {
          options.errors = options.errorObj.errorCauses;
        }
      }

      return {
        getFieldName: function (errorSummary) {
          return errorSummary.indexOf(':') > -1 ? errorSummary.split(':')[0] : null;
        },

        getMessages: function () {
          var messages = [];
          _.each(options.errors, function (errorMsg) {
            var fieldName = this.getFieldName(errorMsg.errorSummary);
            if (fieldName && options.inputMap[fieldName]) {
              var reFieldName = new RegExp('^' + fieldName);
              messages.push({
                errorSummary: errorMsg.errorSummary.replace(reFieldName, options.inputMap[fieldName])
              });
            } else {
              messages.push(errorMsg);
            }
          }, this);
          return messages;
        },

        getInputs: function () {
          var fieldNames = [];
          _.each(options.errors, function (errorMsg) {
            var fieldName = this.getFieldName(errorMsg.errorSummary);
            if (options.inputMap.hasOwnProperty(fieldName)) {
              fieldNames.push(fieldName);
            }
          }, this);
          return fieldNames;
        },

        /**
         * Reformat error messages if there is another error field after 'ErrorSummary'
         *
         * Error = [{errorSummary: 'errorType: replacingSignOnModes'}] is converted to
         *         {errorType : 'replacingSignOnModes'}
         *
         * Error = [{errorSummary: 'Some Error msg'}] -> no change
         */
        getReformattedMessages: function () {
          var messages = {};
          _.each(options.errors, function (errorMsg) {
            if (_.isUndefined(errorMsg.errorSummary)) {
              messages['errorSummary'] = errorMsg;
            } else {
              var fields = errorMsg.errorSummary.indexOf(':') > -1 ? errorMsg.errorSummary.split(': ') : null;
              if (fields) {
                messages[fields[0]] = fields[1];
              } else {
                messages['errorSummary'] = errorMsg.errorSummary;
              }
            }
          }, this);
          return messages;
        }
      };
    }
  };
});
