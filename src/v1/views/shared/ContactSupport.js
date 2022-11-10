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
export default View.extend({
  template: hbs(
    '\
      <div class="infobox">\
        <span class="icon info-16"></span>\
        <p>{{i18n code="contact.support" bundle="login" arguments="helpSupportNumber"}}</p>\
      </div>'
  ),
  className: 'contact-support',

  getTemplateData: function() {
    return this.settings.pick('helpSupportNumber');
  },
});
