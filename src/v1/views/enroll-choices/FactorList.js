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

import { _, ListView, View, createButton, loc } from '@okta/courage';
import hbs from '@okta/handlebars-inline-precompile';
import FactorUtil from 'util/FactorUtil';
import RouterUtil from 'v1/util/RouterUtil';
const cardinalityTextTpl = hbs('<span class="factor-cardinality">{{cardinalityText}}</span>');
const FactorListFactorRow = View.extend({
  tagName: 'li',

  className: 'enroll-factor-row clearfix',

  template: hbs(
    '\
      <div class="enroll-factor-icon-container">\
        <div class="factor-icon enroll-factor-icon {{iconClassName}}">\
        </div>\
      </div>\
      <div class="enroll-factor-description">\
        <h3 class="enroll-factor-label">{{factorLabel}}</h3>\
        {{#if factorDescription}}\
          <p>{{factorDescription}}</p>\
        {{/if}}\
        <div class="enroll-factor-button"></div>\
      </div>\
    '
  ),

  attributes: function() {
    return { 'data-se': this.model.get('factorName') };
  },

  children: function() {
    const children = [];
    const enrolled = this.model.get('enrolled');
    const required = this.model.get('required');
    const cardinality = this.model.get('cardinality');

    if (this.options.showInlineSetupButton) {
      return [
        [
          createButton({
            className: 'button',
            title: this.getSetupButtonText(),
            click: function() {
              this.options.appState.trigger(
                'navigate',
                RouterUtil.createEnrollFactorUrl(this.model.get('provider'), this.model.get('factorType'))
              );
            },
          }),
          '.enroll-factor-button',
        ],
      ];
    } else if (enrolled) {
      children.push(['<span class="icon success-16-green"></span>', '.enroll-factor-label']);
    } else if (required) {
      children.push(['<span class="icon success-16-gray"></span>', '.enroll-factor-label']);
    }

    const cardinalityText = FactorUtil.getCardinalityText(enrolled, required, cardinality);

    if (cardinalityText) {
      children.push([cardinalityTextTpl({ cardinalityText: cardinalityText }), '.enroll-factor-description']);
    }
    return children;
  },

  minimize: function() {
    this.$el.addClass('enroll-factor-row-min');
  },

  maximize: function() {
    this.$el.removeClass('enroll-factor-row-min');
  },

  getSetupButtonText: function() {
    return this.model.get('additionalEnrollment')
      ? loc('enroll.choices.setup.another', 'login')
      : loc('enroll.choices.setup', 'login');
  },
});
export default ListView.extend({
  className: 'enroll-factor-list',

  item: FactorListFactorRow,

  itemSelector: '.list-content',

  template: hbs(
    '\
      {{#if listTitle}}\
        <h3 class="list-title">{{listTitle}}</h3>\
      {{/if}}\
      <ul class="list-content"></ul>\
    '
  ),

  getTemplateData: function() {
    const json = ListView.prototype.getTemplateData.call(this);

    _.extend(json, this);
    return json;
  },

  postRender: function() {
    if (this.options.minimize) {
      this.invoke('minimize');
    }
  },
});
