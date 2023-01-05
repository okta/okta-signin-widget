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

import { _, internal } from '@okta/courage';
let { BaseSchema } = internal.models;
export default BaseSchema.Model.extend({
  expand: ['schema'],
  setFieldPlaceholder: function(formFields) {
    _.each(formFields, function(formField) {
      formField.title = formField.label;
    });
    return formFields;
  },
  initialize: function(options) {
    let profileAttributes = options.profileSchemaAttributes;

    profileAttributes = this.setFieldPlaceholder(profileAttributes);
    if (profileAttributes) {
      const userProfileSchema = {
        properties: {},
      };

      for (var i = 0; i < profileAttributes.length; i++) {
        const profileAttributeObject = profileAttributes[i];

        userProfileSchema.properties[profileAttributeObject.name] = profileAttributeObject;
      }
      this.parse.apply(this, [{ schema: userProfileSchema }]);
    }
  },
});
