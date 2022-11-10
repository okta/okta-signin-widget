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

import { _, $, loc, internal } from '@okta/courage';
import FactorUtil from 'util/FactorUtil';
import Factor from 'v1//models/Factor';
import FactorsDropDownOptions from './FactorsDropDownOptions';
const { BaseDropDown } = internal.views.components;

$(document).click(function(e) {
  const $target = $(e.target);
  const isDropdown = $target.closest('.option-selected').length > 0 && $target.closest('.dropdown').length > 0;

  if (!isDropdown) {
    $('.dropdown .options').hide();
    $('.dropdown a.option-selected').attr('aria-expanded', false);
  }
});

export default BaseDropDown.extend({
  className: 'bg-helper icon-button',
  screenReaderText: function() {
    const factors = this.options.appState.get('factors');
    let factor;
    let factorLabel;

    if (factors) {
      factor = FactorUtil.findFactorInFactorsArray(factors, this.options.provider, this.options.factorType);
    } else {
      factor = new Factor.Model(this.options.appState.get('factor'), this.toJSON());
    }
    factorLabel = factor.get('factorLabel');
    return loc('mfa.factors.dropdown.sr.text', 'login', [factorLabel]);
  },
  events: {
    'click a.option-selected': function(e) {
      e.preventDefault();
      if (_.result(this, 'disabled')) {
        e.stopPropagation();
      } else {
        const expanded = this.$('.options').toggle().is(':visible');

        this.$('a.option-selected').attr('aria-expanded', expanded);
        if (expanded) {
          this.$('#okta-dropdown-options').find('li.factor-option:first a').focus();
        }
      }
    },
    'click .dropdown-disabled': function(e) {
      e.preventDefault();
      e.stopPropagation();
    },
  },
  initialize: function() {
    this.addOption(FactorsDropDownOptions.getDropdownOption('TITLE'));
    const factorsList = this.options.appState.get('factors');
    const multiplePushFactors = factorsList.hasMultipleFactorsOfSameType('push');

    factorsList.each(function(factor) {
      // Do not add okta totp if there are multiple okta push (each push will have an inline totp)
      if (!(factor.get('factorType') === 'token:software:totp' && multiplePushFactors)) {
        this.addOption(FactorsDropDownOptions.getDropdownOption(factor.get('factorName')), { model: factor });
        this.listenTo(this.last(), 'options:toggle', function() {
          this.$('.options').hide();
          this.$('a.option-selected').attr('aria-expanded', false);
        });
      }
    }, this);
  },
});
