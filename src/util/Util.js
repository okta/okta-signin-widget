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

/*global JSON */
/*jshint maxcomplexity:8 */
define(['okta'], function (Okta) {

  var Util = {};
  var _ = Okta._;

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

  return Util;

});
