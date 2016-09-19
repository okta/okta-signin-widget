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

/*jshint newcap:false */
/*global JSON */

define([
  'underscore',
  'vendor/lib/q',
  'jquery',
  'json!nls/login',
  'json!nls/country',
  'util/Logger',
  'json!config/config'
], function (_, Q, $, login, country, Logger, config) {

  var STORAGE_KEY = 'osw.languages';

  var textUrlTpl = _.template(
    '{{baseUrl}}/labels/jsonp/{{bundle}}_{{languageCode}}.jsonp'
  );

  /**
   * Converts options to our internal format, which distinguishes between
   * login and country bundles.
   *
   * Example options.text passed in by the developer:
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
  function parseOverrides(textOption) {
    if (!textOption) {
      return {};
    }
    return _.mapObject(textOption, function (props) {
      var mapped = { login: {}, country: {} };
      if (!_.isObject(props)) {
        throw new Error('Invalid format for "text"');
      }
      _.each(props, function (val, key) {
        var split = key.split(/^country\./);
        if (split.length > 1) {
          mapped.country[split[1]] = val;
        }
        else {
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
    var storage = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!storage || storage.version !== config.version) {
      storage = {
        version: config.version
      };
    }
    return storage;
  }

  function addLanguageToCache(language, loginJson, countryJson) {
    var current = getCachedLanguages();
    current[language] = {
      login: loginJson,
      country: countryJson
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  }

  // We use jsonp to get around any CORS issues if the developer is using
  // the hosted version of the widget - by default, the assetBundleUrl is
  // tied to the Okta CDN. AssetBundleUrl is provided as a workaround if the
  // developer wants to host these files on their own domain, or if they are
  // using a new version of the widget whose language files haven't been
  // published to the CDN yet.
  function fetchJsonp(bundle, language, assetBaseUrl) {
    var languageCode = language.replace('-', '_'),
        url = textUrlTpl({
          baseUrl: assetBaseUrl,
          bundle: bundle,
          languageCode: languageCode
        });
    return $.ajax({
      url: url,
      dataType: 'jsonp',
      cache: true,
      // jQuery jsonp doesn't handle errors, so set a long timeout as a
      // fallback option
      timeout: 5000,
      jsonpCallback: 'jsonp_' + bundle
    });
  }

  function getBundles(language, assetBaseUrl) {
    // Two special cases:
    // 1. English is already bundled with the widget
    // 2. If the language is not in our config file, it means that they've
    //    probably defined it on their own.
    if (language === 'en' || !_.contains(config.supportedLanguages, language)) {
      return Q({});
    }

    var cached = getCachedLanguages();
    if (cached[language]) {
      return Q(cached[language]);
    }

    return Q.all([
      fetchJsonp('login', language, assetBaseUrl),
      fetchJsonp('country', language, assetBaseUrl)
    ])
    .spread(function (loginJson, countryJson) {
      addLanguageToCache(language, loginJson, countryJson);
      return { login: loginJson, country: countryJson };
    })
    .fail(function () {
      // If there is an error, this will default to the bundled language and
      // we will no longer try to load the language this session.
      Logger.warn('Unable to load language: ' + language);
      return {};
    });
  }

  return {
    login: login,
    country: country,

    currentLanguage: null,

    isLoaded: function (language) {
      return this.currentLanguage === language;
    },

    loadLanguage: function (language, overrides, assetBaseUrl) {
      var parsedOverrides = parseOverrides(overrides);
      return getBundles(language, assetBaseUrl)
      .then(_.bind(function (bundles) {
        // Always extend from the built in defaults in the event that some
        // properties are not translated
        this.login = _.extend({}, login, bundles.login);
        this.country = _.extend({}, country, bundles.country);
        if (parsedOverrides[language]) {
          _.extend(this.login, parsedOverrides[language]['login']);
          _.extend(this.country, parsedOverrides[language]['country']);
        }
        this.currentLanguage = language;
      }, this));
    }

  };

});
