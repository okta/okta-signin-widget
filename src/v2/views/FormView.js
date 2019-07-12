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
/* eslint max-len: [2, 130] */
define([
  'okta',
], function (Okta) {
  return Okta.View.extend({
    initialize: function (options) {
      this.options = options;
      var remediation = this.options.appState.get('remediation');
      if (remediation[0]) {
        this.formData = this.options.appState.get('formSchema');
        this.uiSchema = this.options.appState.get('uiSchema');
      }
      //TODO integrate with FormBuilder OKTA-236336
      //this.add(FormBuilder.createInputOptions(this.formData, this.uiSchema));
    },
  });
});
