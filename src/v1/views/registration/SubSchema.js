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

import { View } from '@okta/courage';
import hbs from '@okta/handlebars-inline-precompile';
const SubSchemaSubSchema = View.extend({
  index: '',
  message: '',
  class: function() {
    return;
  },
  className: function() {
    return 'subschema-unsatisfied subschema-' + this.index;
  },
  template: hbs(
    '\
      <p class="default-schema">\
        <span class="icon icon-16"></span>\
        {{message}}\
      </p>\
    '
  ),
  getTemplateData: function() {
    return {
      message: this.message,
    };
  },
});
export default View.extend({
  className: 'subschema',

  children: function() {
    return this.subSchemas.map(function(subSchema, index) {
      const description = subSchema.get('description');
      const message = description;
      // TODO API should send translated strings instead of i18n code inside description
      // or send param with i18n code

      return SubSchemaSubSchema.extend({
        index: index,
        message: message,
      });
    });
  },
});
