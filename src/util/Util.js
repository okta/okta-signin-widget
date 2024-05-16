/* eslint-disable max-statements */
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
import _ from 'underscore';
import { loc } from './loc';
import Enums from './Enums';
import Logger from './Logger';
import BrowserFeatures from './BrowserFeatures';

const Util = {};
const ovDeepLink = 'redirect_uri=https://login.okta.com/oauth/callback';

const buildInputForParameter = function(name, value) {
  const input = document.createElement('input');

  input.name = name;
  input.value = decodeURIComponent(value);
  input.type = 'hidden';
  return input;
};

const buildSubmitInput = function() {
  const input = document.createElement('input');
  input.type = 'submit';
  return input;
};

const buildDynamicForm = function(url = '', method) {
  const splitOnFragment = url.split('#');
  const fragment = splitOnFragment[1];
  const splitOnQuery = (splitOnFragment[0] || '').split('?');
  const query = splitOnQuery[1];
  let targetUrl = splitOnQuery[0];

  if (fragment) {
    targetUrl += '#' + fragment;
  }

  const form = document.createElement('form');

  form.method = method;
  form.style.display = 'none';
  form.action = targetUrl;
  if (query && query.length) {
    const queryParts = query.split('&');

    queryParts.forEach(queryPart => {
      const parameterParts = queryPart.split('=');
      const input = buildInputForParameter(parameterParts[0], parameterParts[1]);

      form.appendChild(input);
    });
  }
  form.appendChild(buildSubmitInput());

  return form;
};

// eslint-disable-next-line complexity
Util.transformErrorXHR = function(xhr) {
  // Handle network connection error
  if (xhr.status === 0 && _.isEmpty(xhr.responseJSON)) {
    xhr.responseJSON = { errorSummary: loc('error.network.connection', 'login') };
    return xhr;
  }
  if (!xhr.responseJSON) {
    if (!xhr.responseText) {
      // Empty server response
      xhr.responseJSON = { errorSummary: loc('error.unsupported.response', 'login') };
      return xhr;
    }
    if (typeof xhr.responseText === 'string') {
      try {
        xhr.responseJSON = JSON.parse(xhr.responseText);
      } catch (e) {
        // Malformed server response
        xhr.responseJSON = { errorSummary: loc('error.unsupported.response', 'login') };
        return xhr;
      }
    } else if (typeof xhr.responseText === 'object') {
      xhr.responseJSON = xhr.responseText;
    }
  }
  // Temporary solution to display field errors
  // Assuming there is only one field error in a response
  if (xhr.responseJSON && xhr.responseJSON.errorCauses && xhr.responseJSON.errorCauses.length) {
    xhr.responseJSON.errorSummary = xhr.responseJSON.errorCauses[0].errorSummary;
  }
  // Replace error messages
  if (!_.isEmpty(xhr.responseJSON)) {
    const { errorCode } = xhr.responseJSON;
    const untranslatedErrorCodes = [
      // API already provides localized and factor specific error message in errorCauses
      'E0000068',
      // API provides localized error message for password requirements in errorCauses
      'E0000014',
    ];
    const errorMsg = errorCode && !untranslatedErrorCodes.includes(errorCode)
      // We don't pass parameters to the `loc()` util
      // However some i18n keys like `errors.E0000001` require one parameter
      // Don't dispatch custom 'okta-i18n-error' event in this case
      ? loc('errors.' + errorCode, 'login', [], true)
      : undefined;

    if (errorMsg?.indexOf('L10N_ERROR[') === -1) {
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
Util.toLower = function(strings) {
  return _.map(strings, function(str) {
    return str.toLowerCase();
  });
};

// A languageCode can be composed of multiple parts, i.e:
// {{language}}-{{region}}-{{dialect}}
//
// In these cases, it's necessary to generate a list of other possible
// combinations that we might support (in preferred order).
//
// For example:
// en-US -> [en-US, en]
// de-DE-bavarian -> [de-DE-bavarian, de-DE, de]
function expandLanguage(language) {
  const expanded = [language];
  const parts = language.split('-');

  while (parts.pop() && parts.length > 0) {
    expanded.push(parts.join('-'));
  }
  return expanded;
}

// Following the rules of expanding one language, this will generate
// all potential languages in the given order (where higher priority is
// given to expanded languages over other downstream languages).
Util.expandLanguages = function(languages) {
  return _.chain(languages).map(expandLanguage).flatten().uniq().value();
};

//helper to call setTimeout
Util.callAfterTimeout = function(callback, time) {
  return setTimeout(callback, time);
};

// Helper function to provide consistent formatting of template literals
// that are logged when in development mode.
Util.debugMessage = function(message) {
  Logger.warn(`\n${message.replace(/^(\s)+/gm, '')}`);
};

Util.logConsoleError = function(message) {
  Logger.error(message);
};

// Trigger an afterError event
Util.triggerAfterError = function(controller, err = {}) {
  if (!err.statusCode && err.xhr && err.xhr.status) {
    // Bring the statusCode to the top-level of the Error
    err.statusCode = err.xhr.status;
  }
  // Some controllers return the className as a function - process it here:
  const className = _.isFunction(controller.className) ? controller.className() : controller.className;

  const error = _.pick(err, 'name', 'message', 'statusCode', 'xhr');

  controller.trigger('afterError', { controller: className }, error);
  // Logs to console only in dev mode
  Logger.warn('controller: ' + className + ', error: ' + error);
};

Util.redirect = function(url, win = window, isAppLink = false) {
  if (BrowserFeatures.isAndroid() && !isAppLink) {
    Util.redirectWithFormGet(url);
  } else {
    Util.changeLocation(url, win);
  }
};

Util.changeLocation = function(url, win = window) {
  if (!url) {
    Logger.error(`Cannot redirect to empty URL: (${url})`);
    return;
  }
  win.location.href = url;
};

Util.executeOnVisiblePage = function(cb) {
  if (document.visibilityState === 'hidden') {
    const visibilityChangeHandler = () => {
      if (document.visibilityState === 'visible') {
        document.removeEventListener('visibilitychange', visibilityChangeHandler);
        cb();
      }
    };
    document.addEventListener('visibilitychange', visibilityChangeHandler);
  } else {
    cb();
  }
};

Util.isAndroidOVEnrollment = function() {
  const ovEnrollment = decodeURIComponent(window.location.href).includes(ovDeepLink);
  return BrowserFeatures.isAndroid() && ovEnrollment;
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
Util.redirectWithFormGet = function(url) {
  Util.redirectWithForm(url, 'get');
};

Util.redirectWithForm = function(url, method = 'post') {
  if (!url) {
    Logger.error(`Cannot redirect to empty URL: (${url})`);
    return;
  }

  const mainContainer = document.getElementById(Enums.WIDGET_CONTAINER_ID);

  if (!mainContainer) {
    Logger.error('Cannot find okta-sign-in container append to which a form');
    return;
  }

  const form = buildDynamicForm(url, method);

  mainContainer.appendChild(form);
  form.querySelector('input[type="submit"]').click();
};

/**
 * When we want to show an explain text, we need to check if this is different from
 * the label text, to not have an explain that look like a duplicated label.
 * okta-signin-widget gives the possibility to customize every i18n, so we cannot
 * know ahead if these two are equal or different, we need to call this function everytime.
 */
Util.createInputExplain = function(explainKey, labelKey, bundleName, explainParams, labelParams) {
  const explain = explainParams ? loc(explainKey, bundleName, explainParams) : loc(explainKey, bundleName);
  const label = labelParams ? loc(labelKey, bundleName, labelParams) : loc(labelKey, bundleName);

  if (explain === label) {
    return false;
  }
  return explain;
};

Util.isV1StateToken = function(token) {
  return !!(token && _.isString(token) && token.startsWith('00'));
};

Util.getAutocompleteValue = function(settings, defaultValue) {
  const shouldDisableAutocomplete = settings?.get('features.disableAutocomplete');
  if (shouldDisableAutocomplete) {
    return 'off';
  }
  return defaultValue;
};

/**
 * Equivalent of `new URLSearchParams(params).toString()` with broadest browser support.
 * Does not include params with nullish values.
 */
Util.searchParamsToString = function(params) {
  return Object.keys(params)
    .filter((key) => {
      const val = params[key];
      return val !== undefined && val !== null;
    })
    .map((key) => {
      return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
    })
    .join('&');
};

export default Util;
