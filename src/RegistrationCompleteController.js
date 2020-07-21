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

import hbs from 'handlebars-inline-precompile';

define([
  'okta',
  'util/Enums',
  'util/FormController',
  'util/FormType'
],
function (Okta, Enums, FormController, FormType) {

  return FormController.extend({
    events: {
      'click .back-btn' : function (e) {
        e.preventDefault();
        this.back();
      }
    },
    back: function () {
      this.state.set('navigateDir', Enums.DIRECTION_BACK);
      this.options.appState.trigger('navigate', '');
    },
    className: 'registration-complete',
    Model: function () {
    },
    initialize: function () {
      this.settings.callGlobalSuccess(Enums.ACTIVATION_EMAIL_SENT, {
        username: this.options.appState.get('username')
      });
    },
    Form: {
      noButtonBar: true,
      formChildren: function () {
        return [
          FormType.View({
            View: Okta.View.extend({
              template: hbs('\
              <div class="container">\
              <span class="title-icon icon icon-16 confirm-16-green"></span>\
              <h2 class="title">{{title}}</h2>\
              <div class="desc">{{desc}}</div>\
              </div>\
              <a href="#" class="back-btn" data-se="back-link">\
                {{i18n code="goback" bundle="login"}}\
              </a>\
              '),
              getTemplateData: function () {
                return { 
                  'desc': Okta.loc('registration.complete.confirm.text', 'login'),
                  'title': Okta.loc('registration.complete.title', 'login')
                };
              }
            })
          })
        ];
      }
    }
  });

});