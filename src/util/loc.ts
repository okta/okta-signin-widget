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

import _ from 'underscore';
import Bundles from './Bundles';

const bundleNames = ['login', 'country'];
type BundleName = typeof bundleNames[number];
type Bundles = {
  [key in BundleName]: {
    [key: string]: string
  };
};
const bundles: Bundles = Object.fromEntries(
  bundleNames.map(bundleName => [bundleName, Bundles[bundleName]])
);

/**
 * Translate a key to the localized value
 * @param  {String} key The key
 * @param  {String} [bundle="login"] The name of the i18n bundle. Defaults to "login".
 * @param  {Array} [params] A list of parameters to apply as tokens to the i18n value
 * @return {String} The localized value
 */
export const loc = function (key: string, bundleName: BundleName = 'login', params: string[] = []) {
  const bundle = bundles[bundleName];
  /* eslint complexity: [2, 6] */

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
    emitL10nError(key, bundleName, 'parameters');
    return 'L10N_ERROR[' + key + ']';
  }
};

/**
 *
 * CustomEvent polyfill for IE
 * https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent#polyfill
 */
const createCustomEvent = function (event: string, params: CustomEventInit) {
  if (window.CustomEvent) {
    return new CustomEvent(event, params);
  } else {
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
  document.dispatchEvent(event);
}


function sprintf(value: string, args: string[]) {
  /* eslint max-statements: [2, 15] */

  function triggerError() {
    throw new Error('Mismatch number of variables: ' + value + ', ' + JSON.stringify(args));
  }

  let oldValue = value, newValue = value;
  for (var i = 0, l = args.length; i < l; i++) {
    const entity = args[i];
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
};
