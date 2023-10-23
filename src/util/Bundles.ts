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

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import config from 'config/config.json';
import fetch from 'cross-fetch';
import country from 'nls/country.json';
import login from 'nls/login.json';
import _ from 'underscore';
import BrowserFeatures from 'util/BrowserFeatures';
import Logger from 'util/Logger';
const STORAGE_KEY = 'osw.languages';

declare type i18nOptions = {
  [localeOrCountry: string]: {
    [i18nKey: string]: string;
  }
}

declare type Assets = {
  baseUrl: string;
  rewrite(origPath: string): string;
}

/**
 * Converts options to our internal format, which distinguishes between
 * login and country bundles.
 *
 * Example options.i18n passed in by the developer:
 * {
 *   'en': {
 *     'needhelp': 'need help override',
 *     'primaryauth.title': 'new sign in text',
 *     'country.JP' = 'Japan, Japan'
 *   }
 * }
 *
 * Parsed:
 * {
 *  'en': {
 *    'login': {
 *      'needhelp': 'need help override',
 *      'primaryauth.title': 'new sign in text',
 *    },
 *    'country': {
 *      'JP': 'Japan, Japan'
 *    }
 *  }
 * }
 */
function parseOverrides(i18n) {
  if (!i18n) {
    return {};
  }

  const i18nWithLowerCaseKeys = {};

  _.each(_.keys(i18n), function(key) {
    i18nWithLowerCaseKeys[key.toLowerCase()] = i18n[key];
  });

  return _.mapObject(i18nWithLowerCaseKeys, function(props) {
    const mapped = { login: {}, country: {} };

    if (!_.isObject(props)) {
      throw new Error('Invalid format for "i18n"');
    }
    _.each(props, function(val, key) {
      const split = key.split(/^country\./);

      if (split.length > 1) {
        mapped.country[split[1]] = val;
      } else {
        mapped.login[split[0]] = val;
      }
    });
    return mapped;
  });
}

// Caching: We only bundle English by default in the Sign-In Widget. Other
// languages are loaded on demand and cached in localStorage. These languages
// are tied to the version of the widget - when it bumps, we reset the cache.

function getCachedLanguages() {
  let storage = JSON.parse(localStorage.getItem(STORAGE_KEY));

  if (!storage || storage.version !== config.version) {
    storage = {
      version: config.version,
    };
  }
  return storage;
}

function addLanguageToCache(language, loginJson, countryJson) {
  const current = getCachedLanguages();

  current[language] = {
    login: loginJson,
    country: countryJson,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
}

// By default, the assets.bundleUrl is tied to the Okta CDN.
//
// There are two overrides available for modifying where we load the asset
// bundles from:
//
// 1. assets.baseUrl
//
//    This is the base path the OSW pulls assets from, which in this case is
//    the Okta CDN. Override this config option if you want to host the
//    files on your own domain, or if you're using a new version of the
//    widget whose language files haven't been published to the CDN yet.
//
// 2. assets.rewrite
//
//    This is a function that can be used to modify the path + fileName of
//    the bundle we're loading, relative to the baseUrl. When called, it
//    will pass the current path, and expect the new path to be returned.
//    This is useful, for example, if your build process has an extra
//    cachebusting step, i.e:
//
//    function rewrite(file) {
//      // file: /labels/json/login_ja.json
//      return file.replace('.json', '.' + md5file(file) + '.json');
//    }
//
// Note: Most developers will not need to use these overrides - the default
// is to use the Okta CDN and to use the same path + file structure the
// widget module publishes by default.
function fetchJson(bundle, language, assets) {
  // Our bundles use _ to separate country and region, i.e:
  // zh-CN -> zh_CN
  const languageCode = language.replace('-', '_');

  const path = assets.rewrite(encodeURI(`/labels/json/${bundle}_${languageCode}.json`));

  const headers = {
    Accept: 'application/json',
    'Content-Type': 'text/plain',
  };

  const mode = 'no-cors';

  return fetch(assets.baseUrl + path, {
    method: 'GET',
    headers,
    mode,
  })
    .then(res => res.text())
    .then(txt => JSON.parse(txt));
}

async function getBundles(language, assets, supportedLanguages) {
  // Two special cases:
  // 1. Default language is already bundled with the widget
  // 2. If the language is not in our config file, it means that they've
  //    probably defined it on their own.
  if (language === config.defaultLanguage || !_.contains(supportedLanguages, language)) {
    return {};
  }

  //local storage does not work correctly with android web views (embeded browers)
  //so skip the caching and just make the request to get the local info
  const localStorageIsSupported = !BrowserFeatures.localStorageIsNotSupported();

  if (localStorageIsSupported) {
    const cached = getCachedLanguages();

    if (cached[language]) {
      return cached[language];
    }
  }

  try {
    const [loginJson, countryJson] = await Promise.all([
      fetchJson('login', language, assets),
      fetchJson('country', language, assets)
    ]);
    if (localStorageIsSupported) {
      addLanguageToCache(language, loginJson, countryJson);
    }
    return { login: loginJson, country: countryJson };
  } catch(_e) {
    // If there is an error, this will default to the bundled language and
    // we will no longer try to load the language this session.
    Logger.warn('Unable to load language: ' + language);
    return {};
  }
}

export default {
  login: login,
  country: country,
  // Courage components within the sign in widget point to courage bundle to look
  // up i18nkeys. Since we dont have courage.properties inside the sign in widget
  // we are pointing courage bundle to login.
  courage: login,

  currentLanguage: null,

  isLoaded: function(language: string): boolean {
    return this.currentLanguage === language;
  },

  remove: function(): void {
    this.currentLanguage = null;
  },

  loadLanguage: async function(language: string, overrides: i18nOptions, assets: Assets, supportedLanguages: string[]): Promise<void> {
    const parsedOverrides = parseOverrides(overrides);
    const lowerCaseLanguage = language.toLowerCase();
    const bundles = await getBundles(language, assets, supportedLanguages);
    // Always extend from the built in defaults in the event that some
    // properties are not translated
    this.login = _.extend({}, login, bundles.login);
    this.country = _.extend({}, country, bundles.country);
    this.courage = _.extend({}, login, bundles.login);
    if (parsedOverrides[lowerCaseLanguage]) {
      _.extend(this.login, parsedOverrides[lowerCaseLanguage]['login']);
      _.extend(this.country, parsedOverrides[lowerCaseLanguage]['country']);
      _.extend(this.courage, parsedOverrides[lowerCaseLanguage]['login']);
    }
    this.currentLanguage = language;
  },
};
