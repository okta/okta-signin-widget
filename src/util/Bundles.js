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

  var bundlePathTpl = _.template('/labels/jsonp/{{bundle}}_{{languageCode}}.jsonp');

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
  // the hosted version of the widget - by default, the assets.bundleUrl is
  // tied to the Okta CDN.
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
  //      // file: /labels/jsonp/login_ja.jsonp
  //      return file.replace('.jsonp', '.' + md5file(file) + '.jsonp');
  //    }
  //
  // Note: Most developers will not need to use these overrides - the default
  // is to use the Okta CDN and to use the same path + file structure the
  // widget module publishes by default.
  function fetchJsonp(bundle, language, assets) {
    var languageCode, path;

    // Our bundles use _ to separate country and region, i.e:
    // zh-CN -> zh_CN
    languageCode = language.replace('-', '_');

    path = assets.rewrite(bundlePathTpl({
      bundle: bundle,
      languageCode: languageCode
    }));

    return $.ajax({
      url: assets.baseUrl + path,
      dataType: 'jsonp',
      cache: true,
      // jQuery jsonp doesn't handle errors, so set a long timeout as a
      // fallback option
      timeout: 5000,
      jsonpCallback: 'jsonp_' + bundle
    });
  }

  function getBundles(language, assets) {
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
      fetchJsonp('login', language, assets),
      fetchJsonp('country', language, assets)
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

    loadLanguage: function (language, overrides, assets) {
      var parsedOverrides = parseOverrides(overrides);
      return getBundles(language, assets)
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
