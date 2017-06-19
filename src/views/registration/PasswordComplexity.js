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

define(['okta', 'util/PasswordComplexityUtil'], function (Okta, PasswordComplexityUtil) {

  var _ = Okta._;

  var PasswordComplexity =  Okta.View.extend({
    name: '',
    message: '',
    id: function() {
      return 'password-complexity-' + this.name;
    },
    className: 'password-complexity-unsatisfied',
    template: '\
      <p>\
        <span class="icon icon-16 confirm-16"/>\
        <span class="icon icon-16 error-16-small"/>\
        {{message}}\
      </p>\
    ',
    getTemplateData: function () {
      return {
        message: this.message
      };
    }
  });

  return Okta.View.extend({
    className: 'password-complexity',

    children: function() {
      return _.map(this.passwordComplexity.enabledComplexities, function(complexityName) {
        var complexityValue = this.get(complexityName);
        var message = PasswordComplexityUtil.complexities[complexityName].getI18nMessage(complexityValue);
        return PasswordComplexity.extend({
          name: complexityName, 
          message: message
        });
      }, this.passwordComplexity);
    }
  });
});
