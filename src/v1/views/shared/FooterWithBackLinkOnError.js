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

import { View } from '@okta/courage';
import hbs from '@okta/handlebars-inline-precompile';
import Enums from 'util/Enums';
export default View.extend({
  template: hbs(
    '\
    {{#if showLink}}\
      <a href="#" class="link help" data-se="back-link">\
        {{i18n code="goback" bundle="login"}}\
      </a>\
    {{/if}}\
    '
  ),
  className: 'auth-footer',
  events: {
    'click .help': function(e) {
      e.preventDefault();
      this.back();
    },
  },
  back: function() {
    this.state.set('navigateDir', Enums.DIRECTION_BACK);
    this.options.appState.trigger('navigate', '');
  },
  getTemplateData: function() {
    const error = this.model.appState.get('flashError');
    const showLink = error.is && error.is('terminal');
    return {
      showLink: showLink
    };
  }
});
