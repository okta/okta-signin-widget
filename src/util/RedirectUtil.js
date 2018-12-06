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
    var chunks = (url || '').split('?');
    var targetUrl = chunks[0];
    var query = chunks[1];
    
    var form = document.createElement('form');
    form.method = 'get';
    form.setAttribute('style', 'display: none;');
    form.action = targetUrl;

    if (query && query.length) {
      var queryParts = query.split('&');

      for (var i = 0; i < queryParts.length; i++) {
        var input = document.createElement('input');
        var parameterParts = queryParts[i].split('=');

        input.name = parameterParts[0];
        input.value = decodeURIComponent(parameterParts[1]);
        input.type = 'hidden';
        form.appendChild(input);    
      }
    }

    return form;
  };

  return fn;
});
