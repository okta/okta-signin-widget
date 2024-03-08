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

// Source code was copied from @okta/courage
//  (src/courage/util/StringUtil.js)
//  and should be kept in sync with @okta/courage

import Bundles from '@okta/okta-i18n-bundles';

const bundleNames = ['login', 'country', 'courage'];
type BundleName = typeof bundleNames[number];
type Bundle = {
  [key: string]: string
};
type Bundles = {
  [key in BundleName]: Bundle;
};

interface L10nErrorDetail {
  type: 'l10n-error';
  key: string;
  bundleName: string;
  reason: string;
}

declare global {
  interface Window {
    okta?: {
      locale?: string
    }
  }
}

/**
 * Translate a key to the localized value
 * @param  {String} key The key
 * @param  {String} [bundle="login"] The name of the i18n bundle. Defaults to "login".
 * @param  {Array} [params] A list of parameters to apply as tokens to the i18n value
 * @param  {Boolean} [ignoreIncorrectParams] If true, a custom 'okta-i18n-error' event would not be dispatched
 * @return {String} The localized value
 */
export const loc = function (
  key: string,
  bundleName: BundleName = 'login',
  params: Array<string | number | boolean | unknown> = [],
  ignoreIncorrectParams = false
) {
  const bundle = getBundle(bundleName);
  /* eslint complexity: [2, 7] */

  if (!bundle) {
    emitL10nError(key, bundleName, 'bundle');
    return 'L10N_ERROR[' + bundleName + ']';
  }

  let value = bundle[key];

  try {
    params = params && params.slice ? params.slice(0) : [];
    value = sprintf(value, params);

    if (value) {
      return value;
    } else {
      emitL10nError(key, bundleName, 'key');
      return 'L10N_ERROR[' + key + ']';
    }
  } catch (e) {
    if (!ignoreIncorrectParams) {
      emitL10nError(key, bundleName, 'parameters');
    }
    return 'L10N_ERROR[' + key + ']';
  }
};

/**
* Converts the locale code identifier from "${languageCode}-${countryCode}" to "${languageCode}_${countryCode}"
* Follows the ISO-639-1 language code and 2-letter ISO-3166-1-alpha-2 country code structure.
* @param {String} locale code identifier
* @return {String} converted locale code identifier
*/
const parseLocale = (locale: string) => {
  if (/-/.test(locale)) {
    const parts = locale.split('-');
    parts[1] = parts[1].toUpperCase();
    return parts.join('_');
  }

  return locale;
};

/**
 * Returns the language bundle based on the current locale.
 * - If a locale is not provided, default to English ('en')
 * - Legacy Support: If the named language bundle does not exist, fall back to the default named bundle.
 *
 * @param {*} bundleName
 */
function getBundle(bundleName: BundleName): Bundle {
  if (!bundleName) {
    const key = Object.keys(Bundles).filter(k => typeof k === 'object')[0];
    return Bundles[key];
  }

  const locale = parseLocale(getRawLocale());
  return Bundles[`${bundleName}_${locale}`] || Bundles[bundleName];
}

/**
 * Returns the user's locale as defined by window.okta.locale
 */
function getRawLocale() {
  return window?.okta?.locale || 'en';
}

/**
 * Dispatch custom 'okta-i18n-error' event
 * @param {String} key The i18n key
 * @param {String} bundleName The i18n bundle name
 * @param {String} reason Could be 'bundle' (Bundle not found), 'key' (Key not found) or 'parameters' (Parameters mismatch).
 */
function emitL10nError(key: string, bundleName: string, reason: string) {
  const event = createCustomEvent('okta-i18n-error', {
    detail: {
      type: 'l10n-error',
      key: key,
      bundleName: bundleName,
      reason: reason
    }
  });
  if (event) {
    document.dispatchEvent(event);
  }
}

const createCustomEvent = function (event: string, params: CustomEventInit<L10nErrorDetail>) {
  if (typeof window.CustomEvent === 'function') {
    return new CustomEvent(event, params);
  } else if (!window.CustomEvent) {
    /**
     * CustomEvent polyfill for IE
     * https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent#polyfill
     */
    params = params || {
      bubbles: false,
      cancelable: false,
      detail: null
    };
    const evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
    return evt;
  }
};

/**
 * Format tempalte string with parameters
 * @param {String} value Template string, eg. "Reset via {0}"
 * @param  {Array} [params] A list of parameters to apply as tokens to the template string, eg. ["SMS"]
 * @return {String} Formatted string value, eg. "Reset via SMS"
 */
function sprintf(value: string, params: Array<string | number | boolean | unknown>) {
  /* eslint max-statements: [2, 15] */

  function triggerError() {
    throw new Error('Mismatch number of variables: ' + value + ', ' + JSON.stringify(params));
  }

  let oldValue = value, newValue = value;
  for (let i = 0, l = params.length; i < l; i++) {
    const entity = String(params[i]);
    const regex = new RegExp('\\{' + i + '\\}', 'g');
    newValue = newValue.replace(regex, entity);

    if (entity === undefined || entity === null || newValue === oldValue) {
      triggerError();
    }

    oldValue = newValue;
  }

  if (/\{[\d+]\}/.test(newValue)) {
    triggerError();
  }

  return newValue;
}
