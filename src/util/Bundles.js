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
  'i18n!nls/login',
  'i18n!nls/country'
], function (login, country) {
  // This module will be built at runtime to include
  // user overrides. This file is currently necessary
  // to run tests. Even when it's no longer required,
  // it shouldn't be empty, because it'd have the
  // same id as the other empty modules if optimized
  // using the Dedupe plugin.
  return {
    login: login,
    country: country
  };
});
