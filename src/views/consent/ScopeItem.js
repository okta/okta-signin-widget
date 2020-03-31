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
  'qtip'
], function (Okta) {

  return Okta.View.extend({
    className: 'scope-item',
    template: '\
      <div class="scope-item-text">\
        <p>{{name}}</p>\
      </div>\
      {{#if description}}\
        <span class="scope-item-tooltip icon form-help-16" />\
      {{/if}}\
    ',

    postRender: function () {
      this.$('.scope-item-tooltip').qtip({
        content: {
          text: this.options.description
        },
        style: { classes: 'okta-sign-in-tooltip qtip-custom qtip-shadow' },
        position: {
          my: 'bottom right',
          target: 'mouse'
        }
      });
    }
  });

});
