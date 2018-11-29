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

define([
  'nls/login.json',
  'nls/country.json'
], function (login, country) {

  return {
    login: login,
    country: country,
    // Courage components within the sign in widget point to courage bundle to look
    // up i18nkeys. Since we dont have courage.properties inside the sign in widget
    // we are pointing courage bundle to login.
    courage: login,

    currentLanguage: null,

    isLoaded: function (language) {
      return this.currentLanguage === language;
    },

    remove: function () {
      this.currentLanguage = null;
    },

    setLanguage: function (language, parsedOverrides, bundles) {
      var lowerCaseLanguage = language.toLowerCase();

      // Always extend from the built in defaults in the event that some
      // properties are not translated
      this.login = Object.assign({}, login, bundles.login);
      this.country = Object.assign({}, country, bundles.country);
      this.courage = Object.assign({}, login, bundles.login);
      if (parsedOverrides[lowerCaseLanguage]) {
        Object.assign(this.login, parsedOverrides[lowerCaseLanguage]['login']);
        Object.assign(this.country, parsedOverrides[lowerCaseLanguage]['country']);
        Object.assign(this.courage, parsedOverrides[lowerCaseLanguage]['login']);
      }
      this.currentLanguage = language;
    },

  };

});
