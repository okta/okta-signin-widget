/*!
 * Copyright (c) 2017, Okta, Inc. and/or its affiliates. All rights reserved.
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
  'okta',
  './ScopeItem'
], function (Okta, ScopeItem) {

  return Okta.View.extend({
    className: 'scope-list detail-row',

    postRender: function () {
      this.model.get('scopes').forEach(scope => {
        this.add(ScopeItem, {
          options: {
            name: scope.displayName || scope.name,
            description: scope.description
          },
        });
      });
    }
  });

});
