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
  'module',
  'i18n!nls/login',
  'i18n!nls/country'
], function (module, login, country) {
  var config = module.config();
  var customLabels = config.labels;
  var localizedCountry = config.country;

  function valid(property, defaultStrings, customStrings) {
    return customStrings.hasOwnProperty(property) &&
           defaultStrings.hasOwnProperty(property) &&
           customStrings[property] !== '';
  }

  // This works like _.extend but prevents an empty custom key
  // from overriding a login key. Also, this removes the need
  // for underscore.
  function customizeLogin(defaultStrings, customStrings) {
    for (var prop in customStrings) {
      if (valid(prop, defaultStrings, customStrings)) {
        defaultStrings[prop] = customStrings[prop];
      }
    }
    return defaultStrings;
  }

  return {
    // The consumer of the widget may specify their own label values.
    // These values are stored in requires module.config() object.
    // We use this to override our own bundle values.
    login: customizeLogin(login, customLabels),
    country: customizeLogin(country, localizedCountry)
  };
});
