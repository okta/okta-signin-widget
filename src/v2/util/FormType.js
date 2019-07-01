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

define(function () {

  // Syntactic sugar to provide some structure to SimpleForm inputs - Just
  // wraps options with { type: type, viewOptions: viewOptions, addOptions: addOptions }

  var INPUT = 'INPUT';
  var BUTTON = 'BUTTON';
  var DIVIDER = 'DIVIDER';
  var TOOLBAR = 'TOOLBAR';
  var VIEW = 'VIEW';

  function wrap (type) {
    return function (viewOptions, addOptions) {
      return { type: type, viewOptions: viewOptions, addOptions: addOptions };
    };
  }

  return {
    Input: wrap(INPUT),
    Button: wrap(BUTTON),
    Divider: wrap(DIVIDER),
    Toolbar: wrap(TOOLBAR),
    View: wrap(VIEW),

    INPUT: INPUT,
    BUTTON: BUTTON,
    DIVIDER: DIVIDER,
    TOOLBAR: TOOLBAR,
    VIEW: VIEW
  };

});
