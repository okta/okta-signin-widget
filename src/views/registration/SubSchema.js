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

define(['okta'], function (Okta) {
  var SubSchema =  Okta.View.extend({
    index: '',
    message: '',
    class: function () {
      return ;
    },
    className: function() {
      return 'subschema-unsatisfied subschema-' + this.index;
    },
    template: '\
      <p>\
        <span class="icon icon-16"/>\
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
    className: 'subschema',

    children: function () {
      return this.subSchemas.map(function(subSchema, index) {
        var keyMap = {
          'registration.passwordComplexity.minLength': {
            'key': 'registration.passwordComplexity.minLength',
            'param': subSchema.get('minLength')
          },
          'registration.passwordComplexity.minNumber': {
            'key': 'registration.passwordComplexity.minNumber',
            'param': '1'
          },
          'registration.passwordComplexity.minLower': {
            'key': 'registration.passwordComplexity.minLower',
            'param': '1'
          },
          'registration.passwordComplexity.minUpper': {
            'key': 'registration.passwordComplexity.minUpper',
            'param': '1'
          },
          'registration.passwordComplexity.minSymbol': {
            'key':'registration.passwordComplexity.minSymbol',
            'param': '1'
          },
          'registration.passwordComplexity.excludeUsername': {
            'key': 'registration.passwordComplexity.excludeUsername'
          }
        };
        var description = subSchema.get('description');
        var key = keyMap[description] && keyMap[description].key;
        var param = keyMap[description] && keyMap[description].param;
        var message = description;
        if (key) {
          message = (param ? Okta.loc(key, 'login', [param]): Okta.loc(key, 'login', []));
        }
        return SubSchema.extend({
          index: index, 
          message: message
        });
      });
    }
  });
});