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

import hbs from 'handlebars-inline-precompile';

/* eslint complexity: [2, 8] */
define([
  'okta',
  'q',
  'util/FactorUtil',
  'views/mfa-verify/dropdown/FactorsDropDown',
  'models/Factor'
],
function (Okta, Q, FactorUtil, FactorsDropDown, Factor) {

  return Okta.View.extend({

    template: hbs('\
      <div class="beacon-blank auth-beacon">\
        <div class="beacon-blank js-blank-beacon-border auth-beacon-border"></div>\
      </div>\
      <div class="bg-helper auth-beacon auth-beacon-factor {{className}}" data-se="factor-beacon">\
        <div class="okta-sign-in-beacon-border auth-beacon-border"></div>\
      </div>\
      <div data-type="factor-types-dropdown" class="factors-dropdown-wrap"></div>\
    '),

    events: {
      'click .auth-beacon-factor': function (e) {
        e.preventDefault();
        e.stopPropagation();
        var expanded = this.$('.dropdown .options').toggle().is(':visible');
        this.$('a.option-selected').attr('aria-expanded', expanded);
        if (expanded) {
          this.$('#okta-dropdown-options').find('li.factor-option:first a').focus();
        }
      }
    },

    initialize: function () {
      this.options.appState.set('beaconType', 'factor');
    },

    getTemplateData: function () {
      var factors = this.options.appState.get('factors'),
          factor, className;
      if (factors) {
        factor = FactorUtil.findFactorInFactorsArray(factors, this.options.provider,
          this.options.factorType);
      } else  {
        factor = new Factor.Model(this.options.appState.get('factor'));
      }
      className = factor.get('iconClassName');
      return { className: className || '' };
    },

    postRender: function () {
      if (this.options.animate) {
        this.$('.auth-beacon-factor').fadeIn(200);
      }
      var appState = this.options.appState;
      if (appState.get('hasMultipleFactorsAvailable')) {
        this.add(FactorsDropDown, '[data-type="factor-types-dropdown"]');
      }
    },

    fadeOut: function () {
      var deferred = Q.defer();
      this.$('.auth-beacon-factor').fadeOut(200, function () {
        deferred.resolve();
      });
      return deferred.promise;
    },

    equals: function (Beacon, options) {
      return Beacon &&
        this instanceof Beacon &&
        options.provider === this.options.provider &&
        (options.factorType === this.options.factorType ||
          (FactorUtil.isOktaVerify(options.provider, options.factorType) &&
          FactorUtil.isOktaVerify(this.options.provider, this.options.factorType)));
    }

  });

});
