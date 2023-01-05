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

import { View } from '@okta/courage';
import hbs from '@okta/handlebars-inline-precompile';
const template = hbs('\
    <span class="icon error-24"></span>\
    <h4><strong>{{{message}}}</strong></h4>\
  ');

// Have to be unescaped for the html in enroll.windowsHello.error.notConfiguredHtml

export default View.extend({
  template: template,
  className: 'okta-infobox-error infobox infobox-error infobox-md margin-btm-25',
  attributes: {
    'data-se': 'o-form-error-html',
  },

  message: '',

  initialize: function(options) {
    if (options && options.message) {
      this.message = options.message;
    }
  },

  getTemplateData: function() {
    return {
      message: this.message,
    };
  },
});
