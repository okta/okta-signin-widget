/*!
 * Copyright (c) 2019, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */
import { createButton, View, ListView } from 'okta';

const FactorRow = View.extend({
  className: 'enroll-factor-row clearfix',
  template: '\
      <div class="enroll-factor-icon-container">\
        <div class="factor-icon enroll-factor-icon {{iconClassName}}">\
        </div>\
      </div>\
      <div class="enroll-factor-description">\
        <h3 class="enroll-factor-label">{{label}}</h3>\
        {{#if factorDescription}}\
          <p>{{factorDescription}} </p>\
        {{/if}}\
        <div class="enroll-factor-button"></div>\
      </div>\
    ',
  children: function (){
    return [[createButton({
      className: 'button select-factor',
      title: function () {
        return 'Select';
      },
      click: function () {
        this.model.trigger('selectFactor', this.model.get('value'));
      }
    }), '.enroll-factor-button']];
  },
  minimize: function () {
    this.$el.addClass('enroll-factor-row-min');
  }
});

export default ListView.extend({

  className: 'enroll-factor-list',

  item: FactorRow,

  itemSelector: '.list-content',

  initialize: function () {
    this.listenTo(this.collection,'selectFactor', function (data) {
      this.model.set(this.options.name, data);
      this.options.appState.trigger('saveForm', this.model);
    });
  },

  template: `
    <div class="list-title">
    {{i18n code="enroll.choices.description" bundle="login"}}
    </div>\
    <div class="list-content"></div>`,

});
