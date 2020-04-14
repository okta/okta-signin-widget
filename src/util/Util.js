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

/* eslint complexity: [2, 13], max-depth: [2, 3] */
define(['q', 'okta', './Logger', './Enums', 'idx'], function (Q, Okta, Logger, Enums, idx) {

  var Util = {};
  var _ = Okta._;
  var { start } = idx.default;


  var buildInputForParameter = function (name, value) {
    var input = document.createElement('input');
    input.name = name;
    input.value = decodeURIComponent(value);
    input.type = 'hidden';
    return input;
  };

  var buildDynamicForm = function (url = '', method) {
    var splitOnFragment = url.split('#');
    var fragment = splitOnFragment[1];

    var splitOnQuery = (splitOnFragment[0] || '').split('?');
    var query = splitOnQuery[1];
    var targetUrl = splitOnQuery[0];
    if (fragment) {
      targetUrl += '#' + fragment;
    }

    var form = document.createElement('form');
    form.method = method;
    form.setAttribute('style', 'display: none;');
    form.action = targetUrl;
    if (query && query.length) {
      var queryParts = query.split('&');
      queryParts.forEach(queryPart => {
        var parameterParts = queryPart.split('=');
        var input = buildInputForParameter(parameterParts[0], parameterParts[1]);
        form.appendChild(input);
      });
    }
    return form;
  };

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
      if (!xhr.responseText) {
        xhr.responseJSON = { errorSummary: Okta.loc('oform.error.unexpected', 'login') };
        return xhr;
      }
      xhr.responseJSON = xhr.responseText;
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
  function expandLanguage (language) {
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

  // Trigger an afterError event
  Util.triggerAfterError = function (controller, err = {}) {
    if (!err.statusCode && err.xhr && err.xhr.status) {
      // Bring the statusCode to the top-level of the Error
      err.statusCode = err.xhr.status;
    }
    // Some controllers return the className as a function - process it here:
    var className = _.isFunction(controller.className) ? controller.className() : controller.className;
    var error = _.pick(err, 'name', 'message', 'statusCode', 'xhr');
    controller.trigger('afterError', { controller: className }, error);
    // Logs to console only in dev mode
    Logger.warn('controller: ' + className + ', error: ' + error);
  };

  Util.redirect = function (url, win = window) {
    if (!url) {
      Logger.error(`Cannot redirect to empty URL: (${url})`);
      return;
    }
    win.location.href = url;
  };

  /**
   * Why redirect via Form get rather using `window.location.href`?
   * At the time of writing, Chrome (<72) in Android would block window location change
   * at following case
   * 1. An AJAX is trigger because of user action.
   * 2. 5+ seconds passed without any further user interaction.
   * 3. User takes an action results in window location change.
   *
   * Luckily we discovered that uses Form submit would work around this problem
   * even though it changed window location.
   *
   * Check the commit history for more details.
   */
  Util.redirectWithFormGet = function (url) {
    Util.redirectWithForm(url, 'get');
  };

  Util.redirectWithForm = function (url, method = 'post') {
    if (!url) {
      Logger.error(`Cannot redirect to empty URL: (${url})`);
      return;
    }

    var mainContainer = document.getElementById(Enums.WIDGET_CONTAINER_ID);
    if (!mainContainer) {
      Logger.error('Cannot find okta-sign-in container append to which a form');
      return;
    }

    var form = buildDynamicForm(url, method);
    mainContainer.appendChild(form);
    form.submit();
  };

  /**
   * When we want to show an explain text, we need to check if this is different from
   * the label text, to not have an explain that look like a duplicated label.
   * okta-signin-widget gives the possibility to customize every i18n, so we cannot
   * know ahead if these two are equal or different, we need to call this function everytime.
   */
  Util.createInputExplain = function (explainKey, labelKey, bundleName, explainParams, labelParams) {
    var explain = explainParams ? Okta.loc(explainKey, bundleName, explainParams) : Okta.loc(explainKey, bundleName);
    var label = labelParams ? Okta.loc(labelKey, bundleName, labelParams) : Okta.loc(labelKey, bundleName);
    if (explain === label) {
      return false;
    }
    return explain;
  };

  Util.isV1StateToken = function (token) {
    return !!(token && _.isString(token) && token.startsWith('00'));
  };

  Util.introspectToken = function (authClient, widgetOptions) {
    const domain = widgetOptions.baseUrl;
    const stateHandle = widgetOptions.stateToken;
    var trans;
    if (this.isV1StateToken(stateHandle)) {
      // V1 pipeline uses authjs.introspect
      trans = authClient.tx.introspect({
        stateToken: widgetOptions.stateToken
      });
    } else {
      // V2 pipeline uses idxjs.start
      trans = start({ domain, stateHandle });
    }
    var deferred = Q.defer();
    if (Q.isPromiseAlike(trans)) {
      trans.then(function (trans) {
        deferred.resolve(trans);
      }).catch(function (err) {
        deferred.reject(err);
      });
    }
    return deferred.promise;
  };

  return Util;

});
