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
  'okta',
  './FactorsDropDownOptions'
],
function (Okta, FactorsDropDownOptions) {
  var _ = Okta._;
  var $ = Okta.$;
  var { BaseDropDown } = Okta.internal.views.components;

  $(document).click(function (e) {
    var $target = $(e.target);
    var isDropdown = $target.closest('.option-selected').length > 0 && $target.closest('.dropdown').length > 0;
    if (!isDropdown) {
      $('.dropdown .options').hide();
    }
  });

  return BaseDropDown.extend({
    className: 'bg-helper icon-button',
    events: {
      'click a.option-selected': function (e) {
        e.preventDefault();
        if (_.result(this, 'disabled')) {
          e.stopPropagation();
        } else {
          this.$('.options').toggle();
        }
      },
      'click .dropdown-disabled': function (e) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    initialize: function () {
      this.addOption(FactorsDropDownOptions.getDropdownOption('TITLE'));
      this.options.appState.get('factors').each(function (factor) {
        this.addOption(FactorsDropDownOptions.getDropdownOption(factor.get('factorName')), {model: factor});
        this.listenTo(this.last(), 'options:toggle', function () {
          this.$('.options').hide();
        });
      }, this);
    }
  });

});
