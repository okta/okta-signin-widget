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
import { View } from 'okta';
import Q from 'q';
import { getFactorData } from '../../util/FactorUtil';

const BeaconView = View.extend({

  template: '\
    <div data-type="beacon-container" class="beacon-container">\
      <div class="beacon-blank auth-beacon">\
        <div class="beacon-blank js-blank-beacon-border auth-beacon-border"></div>\
      </div>\
      <div class="bg-helper auth-beacon auth-beacon-factor {{className}}" data-se="factor-beacon">\
        <div class="okta-sign-in-beacon-border auth-beacon-border"></div>\
      </div>\
      <div data-type="factor-types-dropdown" class="factors-dropdown-wrap"></div>\
    </div >\
    ',

  getTemplateData: function () {
    const factor = this.options.appState.get('factor');
    let className = 'undefined-user';
    if (factor) {
      className = getFactorData(factor.factorType).iconClassName;
    }
    return { className: className || '' };
  },

  fadeOut: function () {
    var deferred = Q.defer();
    this.$('.auth-beacon-factor').fadeOut(200, function () {
      deferred.resolve();
    });
    return deferred.promise;
  },
});

module.exports = BeaconView;
