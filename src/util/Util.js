/*!
 * Copyright (c) 2015-2016, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

/* eslint complexity: [2, 8], max-depth: [2, 3] */
define(['okta', 'util/Logger'], function (Okta, Logger) {

  var Util = {};
  var _ = Okta._;
  var $ = Okta.$;
  var hiddenPostFormTpl = Okta.tpl(
    '<form method="POST" action="{{action}}" style="display:none;">' +
    '{{#each inputs}}'+
    '<input type="hidden" name="{{name}}" value="{{value}}">' +
    '{{/each}}'+
    '</form>');
  
  Util.hasTokensInHash = function (hash) {
    return /((id|access)_token=)/i.test(hash);
  };

  Util.transformErrorXHR = function (xhr) {
    // Handle network connection error
    if (xhr.status === 0 && _.isEmpty(xhr.responseJSON)) {
      xhr.responseJSON = { errorSummary: Okta.loc('error.network.connection', 'login') };
      return xhr;
    }
    if (!xhr.responseJSON) {
      try {
        xhr.responseJSON = JSON.parse(xhr.responseText);
      } catch (parseException) {
        xhr.responseJSON = { errorSummary: Okta.loc('oform.error.unexpected', 'login') };
        return xhr;
      }
    }
    // Temporary solution to display field errors
    // Assuming there is only one field error in a response
    if (xhr.responseJSON && xhr.responseJSON.errorCauses && xhr.responseJSON.errorCauses.length) {
      xhr.responseJSON.errorSummary = xhr.responseJSON.errorCauses[0].errorSummary;
    }
    // Replace error messages
    if (!_.isEmpty(xhr.responseJSON)) {
      var errorMsg = Okta.loc('errors.' + xhr.responseJSON.errorCode, 'login');
      if (errorMsg.indexOf('L10N_ERROR[') === -1) {
        xhr.responseJSON.errorSummary = errorMsg;
        if (xhr.responseJSON && xhr.responseJSON.errorCauses && xhr.responseJSON.errorCauses.length) {
          // BaseForm will consume errorCauses before errorSummary if it is an array,
          // so, we have to make sure to remove it when we have a valid error code
          delete xhr.responseJSON.errorCauses;
        }
      }
    }
    return xhr;
  };

  // Simple helper function to lowercase all strings in the given array
  Util.toLower = function (strings) {
    return _.map(strings, function (str) {
      return str.toLowerCase();
    });
  };

  // A languageCode can be composed of multiple parts, i.e:
  // {{langage}}-{{region}}-{{dialect}}
  //
  // In these cases, it's necessary to generate a list of other possible
  // combinations that we might support (in preferred order).
  //
  // For example:
  // en-US -> [en-US, en]
  // de-DE-bavarian -> [de-DE-bavarian, de-DE, de]
  function expandLanguage(language) {
    var expanded = [language],
        parts = language.split('-');
    while (parts.pop() && parts.length > 0) {
      expanded.push(parts.join('-'));
    }
    return expanded;
  }

  // Following the rules of expanding one language, this will generate
  // all potential languages in the given order (where higher priority is
  // given to expanded languages over other downstream languages).
  Util.expandLanguages = function (languages) {
    return _.chain(languages)
      .map(expandLanguage)
      .flatten()
      .uniq()
      .value();
  };

  //helper to call setTimeout
  Util.callAfterTimeout = function (callback, time) {
    return setTimeout(callback, time);
  };

  // Helper function to provide consistent formatting of template literals
  // that are logged when in development mode.
  Util.debugMessage = function (message) {
    Logger.warn(`\n${message.replace(/^(\s)+/gm, '')}`);
  };

  // Heleper function to submit a url via POST request.
  // what it does is actually create a hidden form
  // and fill values from the url (base url, query parameters)
  // and submit the form.
  Util.postToUrl = function (url, $el) {
    var parts = url.split('?'),
        baseUrl = parts[0],
        queryString = parts[1],
        queryParams,
        form;
    var formData = {
      action: baseUrl
    };
    if (queryString) {
      queryParams = queryString.split('&');
      formData.inputs = _.map(queryParams, function (param) {
        var tokens = param.split('=');
        return {
          name: tokens[0],
          value: decodeURIComponent(tokens[1])
        };
      });
    }
    form = $(hiddenPostFormTpl(formData));
    $el.append(form);
    form.submit();
  };

  return Util;

});
