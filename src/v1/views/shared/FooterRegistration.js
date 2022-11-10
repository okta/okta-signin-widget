/*!
 * Copyright (c) 2016-2017, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import { View, loc } from '@okta/courage';
import hbs from '@okta/handlebars-inline-precompile';
export default View.extend({
  template: hbs(
    '\
        <div class="content-container">\
          <span class="registration-label">{{label}}</span>\
          <a title="{{text}}" aria-label="{{text}}" class="registration-link" href="#">{{text}}</a>\
        </div>\
        '
  ),
  className: 'registration-container',

  events: {
    'click a.registration-link': 'handleClickEvent',
  },

  handleClickEvent: function(e) {
    e.preventDefault();
    const clickHandler = this.settings.get('registration.click');

    if (clickHandler) {
      clickHandler();
    } else if (this.options.appState.get('isIdxStateToken')) {
      this.options.appState.trigger('navigate', 'signin/enroll-user');
    } else {
      this.options.appState.trigger('navigate', 'signin/register');
    }
  },

  getTemplateData: function() {
    const templateData = {
      label: loc('registration.signup.label', 'login'),
      text: loc('registration.signup.text', 'login'),
    };

    return templateData;
  },
});
