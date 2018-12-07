/*!
 * Copyright (c) 2015-2018, Okta, Inc. and/or its affiliates. All rights reserved.
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
  var fn = {};

  /**
   * Redirects the browser to a new URL by directly setting window.location.
   */
  fn.setWindowLocationTo = function (url) {
    window.location = url;
  };

  /**
   * Redirects the browser to a new URL without using window.location.
   */
  fn.redirectTo = function (url) {
    var form = this.buildDynamicForm(url);
    document.body.appendChild(form);
    form.submit();
  };

  fn.buildDynamicForm = function (url) {
    var splitOnFragment = (url || '').split('#');
    var fragment = splitOnFragment[1];
    
    var splitOnQuery = (splitOnFragment[0] || '').split('?');
    var query = splitOnQuery[1];

    var targetUrl = splitOnQuery[0];
    if (fragment) {
      targetUrl += '#' + fragment;
    }
    
    var form = document.createElement('form');
    form.method = 'get';
    form.setAttribute('style', 'display: none;');
    form.action = targetUrl;

    if (query && query.length) {
      var queryParts = query.split('&');

      for (var i = 0; i < queryParts.length; i++) {
        var parameterParts = queryParts[i].split('=');
        var input = this.buildInputForParameter(parameterParts[0], parameterParts[1]);
        form.appendChild(input);
      }
    }

    return form;
  };

  fn.buildInputForParameter = function (name, value) {
    var input = document.createElement('input');
    input.name = name;
    input.value = decodeURIComponent(value);
    input.type = 'hidden';
    return input;
  };

  return fn;
});
